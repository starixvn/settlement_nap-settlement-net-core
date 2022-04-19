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

        public List<ResultDetail> GenerateResultDetail(MatchDetail matchDetail);
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
            var betStatus = GetBetStatus(request.MatchId);
            if (request.IsScoreDirect)
            {
                return GetScore(request);
            }

            return request.Action == ActionType.CalculateHalfTime
                ? GetHalfTimeScore(request.SelectedResources, request.SportType, betStatus)
                : GetFullTimeScore(request.SelectedResources, request.SportType);
        }

        public List<ResultDetail> GenerateResultDetail(MatchDetail matchDetail)
        {
            var setNumber = SetNumber(matchDetail.SportType);
            var resultDetails = Enumerable.Repeat(1, setNumber).Select(i => new ResultDetail()).ToList();
            var arrayBetStatus = ArrayBetStatus(matchDetail.BetStatus);
            var index = 0;
            foreach (var resultDetail in resultDetails)
            {
                var score = ScoreItemOnBetStatus(arrayBetStatus, index);
                var resourceId = GetResourceId(index, setNumber, matchDetail.SportType);

                resultDetail.ResourceId = resourceId;
                resultDetail.HomeValue = score.Home;
                resultDetail.AwayValue = score.Away;
                index++;
            }

            return CreateResultFinal(matchDetail, resultDetails);
        }

        private static string GetResourceId(int currentIndex, int maxSetNumber, int sportType)
        {
            return sportType!= SportType.Squash &&  currentIndex + 1 == maxSetNumber ? "OT" : $"{currentIndex + 1}";
        }

        private static int SetNumber(int sportType)
        {
            const int footBallGroup = 5;
            const int hockeyGroup = 4;
            const int baseballGroup = 10;

            if (GroupSport.FootBall.Contains(sportType))
            {
                return footBallGroup;
            }

            return GroupSport.Hockey.Contains(sportType) ? hockeyGroup : baseballGroup;
        }

        private static Score ScoreItemOnBetStatus(IReadOnlyList<string> betStatus, int currentIndex)
        {
            if (betStatus.Count > currentIndex && betStatus[currentIndex].Trim().IndexOf('-') > 0)
            {
                var score = betStatus[currentIndex].Trim().Split('-');
                return new Score(score[0], score[1]);
            }

            return new Score();
        }

        private static List<ResultDetail> CreateResultFinal(MatchDetail matchDetail, List<ResultDetail> resultDetails)
        {
            if (!GroupSport.Hockey.Contains(matchDetail.SportType))
            {
                var halfTimeResult = new ResultDetail
                {
                    ResourceId = ResourceType.Halftime,
                    HomeValue = matchDetail.HalfTimeHomeScore.ToString(),
                    AwayValue = matchDetail.HalfTimeAwayScore.ToString()
                };
                resultDetails.Add(halfTimeResult);
            }

            var fullTimeResult = new ResultDetail
            {
                ResourceId = ResourceType.Final,
                HomeValue = matchDetail.FinalHomeScore.ToString(),
                AwayValue = matchDetail.FinalAwayScore.ToString()
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
            var resourceSet = resources.Where(item => item.ResourceId != ResourceType.Final
                                                       && item.ResourceId != ResourceType.Halftime &&
                                                       item.ResourceId != "OT").ToList();

            for (var i = 0; i < resourceSet.Count; i++)
            {
                var home = string.IsNullOrEmpty(resources[i].HomeValue) ? "0" : resources[i].HomeValue;
                var away = string.IsNullOrEmpty(resources[i].AwayValue) ? "0" : resources[i].AwayValue;
                finalHomeScore += int.Parse(home);
                finalAwayScore += int.Parse(away);
                if (i == halfTimeNode - 1)
                {
                    htHomeScore += finalHomeScore;
                    htAwayScore += finalAwayScore;
                }
                var currentBetStatus = betStatus.Length > 0 ? "," : string.Empty;
                betStatus.Append($"{currentBetStatus}{home}-{away}");
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
            if (!string.IsNullOrEmpty(otResource.HomeValue) && !string.IsNullOrEmpty(otResource.AwayValue))
            {
                currentScore.FinalHomeScore += int.Parse(otResource.HomeValue);
                currentScore.FinalAwayScore += int.Parse(otResource.AwayValue);

                currentScore.BetStatus.Append($",{otResource.HomeValue}-{otResource.AwayValue}");
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
                FinalHomeScore = ftResult != null && int.TryParse(ftResult.HomeValue, out int value3) ? value3 : 0,
                FinalAwayScore = ftResult != null && int.TryParse(ftResult.AwayValue, out int value4) ? value4 : 0
            };

            return scoreSet;
        }
    }
}