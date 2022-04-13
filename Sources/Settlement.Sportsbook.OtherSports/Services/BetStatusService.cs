using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Constants;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface IBetStatusService
    {
        public ScoreSetModel GenerateBetStatus(CalculateRequest request);

        public List<ResultDetail> GenerateResult(MatchDetail matchDetail, int setCount, string resourceId);
    }

    public class BetStatusServiceImp : IBetStatusService
    {
        private const string RefundFtBetStatus = "Refund FT;";

        private const string RefundBetStatus = "Refund";

        private const int BaseballHTNode = 5;

        private const int FootballHTNode = 2;

        private readonly IDynamicRepository repository;

        public BetStatusServiceImp(IDynamicRepository repository)
        {
            this.repository = repository;
        }

        public ScoreSetModel GenerateBetStatus(CalculateRequest request)
        {
            var lastestBetStatus = GetBetStatus(request.MatchId);
            if (request.IsScoreDirect)
            {
                return GetScore(request);
            }

            return request.Action == ActionType.CalculateHalfTime
                ? GetHalfTimeScore(request.SelectedResources, request.SportType, lastestBetStatus)
                : GetFullTimeScore(request.SelectedResources, request.SportType);
        }

        public List<ResultDetail> GenerateResult(MatchDetail matchDetail, int setCount, string resourceId)
        {
            var arrayBetStatus = ArrayBetStatus(matchDetail.BetStatus);
            var resultDetailOt = new ResultDetail
            {
                ResourceId = "OT"
            };
            var resultDetails = new List<ResultDetail>();
            var betStatusEmpty = string.Join(string.Empty, arrayBetStatus).Length < 1;

            for (var i = 0; i < arrayBetStatus.Length - 1; i++)
            {
                var resultDetail = new ResultDetail
                {
                    ResourceId = $"{i + 1}{resourceId}"
                };
                if (betStatusEmpty)
                {
                    resultDetails.Add(resultDetail);
                    continue;
                }

                var score = arrayBetStatus[i].Trim().Split('-');
                if (i == setCount)
                {
                    resultDetailOt.HomeValue = score[0];
                    resultDetailOt.AwayValue = score[1];
                }
                else
                {
                    resultDetail.HomeValue = score[0];
                    resultDetail.AwayValue = score[1];
                }

                resultDetails.Add(resultDetail);
            }

            resultDetails.Add(resultDetailOt);
            return CreateResultFinal(matchDetail, resultDetails);
        }

        private static List<ResultDetail> CreateResultFinal(MatchDetail matchDetail, List<ResultDetail> resultDetails)
        {
            if (!GroupSport.Hockey.Contains(matchDetail.SportType))
            {
                var halfTimeResult = new ResultDetail
                {
                    ResourceId = ResourceType.Halftime,
                    HomeValue = matchDetail.HalfTimeHomeScore.ToString() ?? "",
                    AwayValue = matchDetail.HalfTimeAwayScore.ToString() ?? ""
                };
                resultDetails.Add(halfTimeResult);
            }

            var fullTimeResult = new ResultDetail
            {
                ResourceId = ResourceType.Final,
                HomeValue = matchDetail.FinalHomeScore.ToString() ?? "",
                AwayValue = matchDetail.FinalAwayScore.ToString() ?? ""
            };
            resultDetails.Add(fullTimeResult);
            return resultDetails;
        }

        private static string[] ArrayBetStatus(string betStatus)
        {
            const int twoLength = 2;
            if (string.IsNullOrWhiteSpace(betStatus))
            {
                return new string[] { };
            }

            return betStatus.IndexOf(';') > -1 && betStatus.Split(';').Length >= twoLength
                ? betStatus.Split(';')[1].Split(',')
                : betStatus.Split(',');
        }

        private string GetBetStatus(int matchId)
        {
            var criteria = new GetMatchInfoCriteria
            {
                MatchId = matchId
            };

            var matchInfo = repository.Get<MatchDetail>(criteria);

            return matchInfo != null ? matchInfo.BetStatus : string.Empty;
        }

        private static ScoreSetModel GetHalfTimeScore(List<ResourceItem> resources, int sportType, string lastestBetStatus)
        {
            var betStatus = new StringBuilder();
            var htHomeScore = 0;
            var htAwayScore = 0;
            var halfTimeNode = sportType == SportType.BaseBall ? BaseballHTNode : FootballHTNode;

            for (var i = 0; i < halfTimeNode; i++)
            {
                htHomeScore += int.Parse(resources[i].HomeValue);
                htAwayScore += int.Parse(resources[i].AwayValue);
                var currentBetStatus = betStatus.Length > 0 ? "," : string.Empty;
                betStatus.Append($"{currentBetStatus}{resources[i].HomeValue}-{resources[i].AwayValue}");
            }

            betStatus = ProcessBetStatus(betStatus, lastestBetStatus, halfTimeNode);

            if (!string.IsNullOrEmpty(lastestBetStatus) && lastestBetStatus.Contains(RefundFtBetStatus))
            {
                betStatus.Insert(0, RefundFtBetStatus);
            }

            return new ScoreSetModel
            {
                BetStatus = betStatus,
                HtHomeScore = htHomeScore,
                HtAwayScore = htAwayScore
            };
        }

        private static ScoreSetModel GetFullTimeScore(List<ResourceItem> resources, int sportType)
        {
            var betStatus = new StringBuilder();
            var htHomeScore = 0;
            var htAwayScore = 0;
            var finalHomeScore = 0;
            var finalAwayScore = 0;
            var halfTimeNode = sportType == SportType.BaseBall ? BaseballHTNode : FootballHTNode;

            for (var i = 0; i < resources.Count - 1; i++)
            {
                if (i == halfTimeNode)
                {
                    htHomeScore += finalHomeScore;
                    htAwayScore += finalAwayScore;
                }

                finalHomeScore += int.Parse(resources[i].HomeValue);
                finalAwayScore += int.Parse(resources[i].AwayValue);
                var currentBetStatus = betStatus.Length > 0 ? "," : string.Empty;
                betStatus.Append($"{currentBetStatus}{resources[i].HomeValue}-{resources[i].AwayValue}");
            }

            var scoreSet = new ScoreSetModel
            {
                BetStatus = betStatus,
                HtHomeScore = htHomeScore,
                HtAwayScore = htAwayScore,
                FinalHomeScore = finalHomeScore,
                FinalAwayScore = finalAwayScore
            };

            return OverTime(scoreSet, resources);
        }

        private static ScoreSetModel OverTime(ScoreSetModel currentScore, List<ResourceItem> resources)
        {
            var otResource = resources.First(item => item.ResourceId == "OT");
            if (otResource.HomeValue != null || otResource.AwayValue != null)
            {
                var home = otResource.HomeValue ?? "0";
                var away = otResource.AwayValue ?? "0";

                currentScore.FinalHomeScore += int.Parse(home);
                currentScore.FinalAwayScore += int.Parse(away);

                currentScore.BetStatus.Append($",{home}-{away}");
            }

            return currentScore;
        }

        private static StringBuilder ProcessBetStatus(StringBuilder betStatus, string lastestBetStatus, int totalHalfTimeSets)
        {
            var oldScore = GetOldScoreOnly(lastestBetStatus);
            if (!string.IsNullOrEmpty(oldScore))
            {
                var scoreFullTime = new StringBuilder();
                var statusList = oldScore.Split(',');
                if (statusList.Length >= totalHalfTimeSets + 1)
                {
                    for (var j = totalHalfTimeSets; j < statusList.Length; j++)
                    {
                        scoreFullTime.Append(statusList[j]);
                        scoreFullTime.Append(j == (statusList.Length - 1) ? string.Empty : ",");
                    }
                }

                if (!string.IsNullOrEmpty(scoreFullTime.ToString()))
                {
                    betStatus.Append($",{scoreFullTime}");
                }
            }

            return betStatus;
        }

        private static string GetOldScoreOnly(string lastestBetStatus)
        {
            var betStatus = lastestBetStatus;
            var scoreOnly = string.Empty;
            if (!string.IsNullOrEmpty(betStatus))
            {
                scoreOnly = betStatus.Contains(RefundBetStatus) ? betStatus.Remove(betStatus.IndexOf('R'), betStatus.IndexOf(';')).Trim(',', ';') : betStatus;
            }

            return scoreOnly;
        }

        private static ScoreSetModel GetScore(CalculateRequest request)
        {
            var htResult = request.SelectedResources.FirstOrDefault(item => item.ResourceId == ResourceType.Halftime);
            var ftResult = request.SelectedResources.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
            var scoreSet = new ScoreSetModel
            {
                BetStatus = new StringBuilder(),
                HtHomeScore = htResult != null && int.TryParse(htResult.HomeValue, out int value) ? value : 0,
                HtAwayScore = htResult != null && int.TryParse(htResult.AwayValue, out int value2) ? value2 : 0,
                FinalHomeScore = int.TryParse(ftResult.HomeValue, out int value3) ? value3 : 0,
                FinalAwayScore = int.TryParse(ftResult.AwayValue, out int value4) ? value4 : 0
            };

            return scoreSet;
        }
    }
}