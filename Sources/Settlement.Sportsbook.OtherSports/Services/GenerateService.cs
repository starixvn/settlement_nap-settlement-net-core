namespace Settlement.Sportsbook.OtherSports.Services;

using Constants;
using Criteria;
using Fanex.Data.Repository;
using Fanex.Settlement.Converter.Services;
using Models;
using Requests;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using System.Collections.Generic;
using System.Text;
using ResourceItem = Settlement.Core.Models.ResourceItem;

public interface GenerateService
{
    public ScoreSetModel GenerateBetStatus(CalculateRequest request);

    public List<ResultDetail> GenerateResultDetail(MatchDetail matchDetail);

    public string CreateResources(List<ResourceItem> selectedResources, string action);

    public List<ResourceItem> GenerateResources(CalculateRequest request);
}

public class GenerateServiceImp : GenerateService
{
    private const int BaseballHtNode = 5;

    private const int FootballHtNode = 2;

    private readonly IDynamicRepository repository;

    private readonly XmlConvertService xmlConvertService;

    private static readonly List<string> ResourceHalfTimeAction = new() { ActionType.UnCalculate, ActionType.RefundHalfTime, ActionType.CalculateHalfTime, ActionType.RefundAll };

    private static readonly List<string> ResourceFullTimeAction = new() { ActionType.UnCalculate, ActionType.RefundFullTime, ActionType.CalculateFullTime,
                                                                     ActionType.CalculateAll, ActionType.RefundAll };

    public GenerateServiceImp(IDynamicRepository repository, XmlConvertService xmlConvertService)
    {
        this.repository = repository;
        this.xmlConvertService = xmlConvertService;
    }

    public string CreateResources(List<ResourceItem> selectedResources, string action)
    {
        var resources = new Resources<ResourceItem>
        {
            ResourceItems = new List<ResourceItem>()
        };
        var halfTime = selectedResources.Find(item => item.ResourceId == ResourceType.Halftime);
        if (halfTime is not null && (ResourceHalfTimeAction.Exists(item => item == action)
                                     || ExistHalfTimeResult(action, halfTime)))
        {
            resources.ResourceItems.Add(halfTime);
        }

        var fullTime = selectedResources.Find(item => item.ResourceId == ResourceType.Final);

        if (fullTime is not null && ResourceFullTimeAction.Exists(item => item == action))
        {
            resources.ResourceItems.Add(fullTime);
        }

        return xmlConvertService.Serialize(resources);
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
        var resultDetails = Enumerable.Repeat(1, setNumber).Select(_ => new ResultDetail()).ToList();
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

    public List<ResourceItem> GenerateResources(CalculateRequest request)
    {
        var listResource = new List<ResourceItem>();
        var resourceHalfTime = new ResourceItem(ResourceType.Halftime)
        {
            AwayValue = request.HalfTimeAwayScore.ToString(),
            HomeValue = request.HalfTimeHomeScore.ToString()
        };
        listResource.Add(resourceHalfTime);

        var resourceFullTime = new ResourceItem(ResourceType.Final)
        {
            AwayValue = request.FinalAwayScore.ToString(),
            HomeValue = request.FinalHomeScore.ToString()
        };
        listResource.Add(resourceFullTime);

        return listResource;
    }

    private static bool ExistHalfTimeResult(string action, ResourceItem halfTime)
    {
        return action == ActionType.CalculateAll && !string.IsNullOrEmpty(halfTime.AwayValue) && !string.IsNullOrEmpty(halfTime.HomeValue);
    }

    private static string GetResourceId(int currentIndex, int maxSetNumber, int sportType)
    {
        return !GroupSport.Squash.Contains(sportType) && currentIndex + 1 == maxSetNumber ? "OT" : $"{currentIndex + 1}";
    }

    private static int SetNumber(int sportType)
    {
        const int footBallGroup = 5;
        const int hockeyGroup = 4;
        const int baseballGroup = 10;

        if (GroupSport.FootBall.Contains(sportType) || GroupSport.Squash.Contains(sportType))
        {
            return footBallGroup;
        }

        return GroupSport.Hockey.Contains(sportType) ? hockeyGroup : baseballGroup;
    }

    private static Score ScoreItemOnBetStatus(IReadOnlyList<string> betStatus, int currentIndex)
    {
        if (betStatus.Count > currentIndex && betStatus[currentIndex].Trim().IndexOf('-') >= 1)
        {
            var score = betStatus[currentIndex].Trim().Split('-');
            return new Score(score[0], score[1]);
        }

        return new Score();
    }

    private static List<ResultDetail> CreateResultFinal(MatchDetail matchDetail, List<ResultDetail> resultDetails)
    {
        if (GroupSport.FootBall.Contains(matchDetail.SportType) || matchDetail.SportType == SportType.BaseBall)
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

    private static ScoreSetModel GetHalfTimeScore(IReadOnlyList<ResourceItem> resources, int sportType, string latestBetStatus)
    {
        var betStatus = new StringBuilder();
        var htHomeScore = 0;
        var htAwayScore = 0;
        var halfTimeNode = sportType == SportType.BaseBall ? BaseballHtNode : FootballHtNode;

        for (var i = 0; i < halfTimeNode; i++)
        {
            htHomeScore += int.Parse(resources[i].HomeValue);
            htAwayScore += int.Parse(resources[i].AwayValue);
            var currentBetStatus = betStatus.Length > 0 ? "," : string.Empty;
            betStatus.Append($"{currentBetStatus}{resources[i].HomeValue}-{resources[i].AwayValue}");
        }

        betStatus = ProcessBetStatus(betStatus, latestBetStatus, halfTimeNode);
        if (!string.IsNullOrEmpty(latestBetStatus) && latestBetStatus.Contains($"{BetStatus.RefundFt};"))
        {
            betStatus.Insert(0, $"{BetStatus.RefundFt};");
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
        var halfTimeNode = sportType == SportType.BaseBall ? BaseballHtNode : FootballHtNode;
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

        SetFinalScoreForSquashTemplate(resources, sportType, ref htHomeScore, ref htAwayScore, ref finalHomeScore, ref finalAwayScore);

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

    private static void SetFinalScoreForSquashTemplate(List<ResourceItem> resources, int sportType, ref int htHomeScore, ref int htAwayScore, ref int finalHomeScore, ref int finalAwayScore)
    {
        if (sportType != SportType.Squash && sportType != SportType.SepakTakraw)
        {
            return;
        }
        htHomeScore = 0;
        htAwayScore = 0;
        var homeValue = resources.Find(item => item.ResourceId == ResourceType.Final)?.HomeValue;
        var awayValue = resources.Find(item => item.ResourceId == ResourceType.Final)?.AwayValue;
        finalHomeScore = int.Parse(string.IsNullOrEmpty(homeValue) ? "0" : homeValue);
        finalAwayScore = int.Parse(string.IsNullOrEmpty(awayValue) ? "0" : awayValue);
    }

    private static ScoreSetModel OverTime(ScoreSetModel currentScore, List<ResourceItem> resources)
    {
        var otResource = resources.Find(item => item.ResourceId == "OT");
        if (string.IsNullOrEmpty(otResource?.HomeValue) || string.IsNullOrEmpty(otResource.AwayValue))
        {
            return currentScore;
        }
        currentScore.FinalHomeScore += int.Parse(otResource.HomeValue);
        currentScore.FinalAwayScore += int.Parse(otResource.AwayValue);

        currentScore.BetStatus.Append($",{otResource.HomeValue}-{otResource.AwayValue}");

        return currentScore;
    }

    private static StringBuilder ProcessBetStatus(StringBuilder betStatus, string latestBetStatus, int totalHalfTimeSets)
    {
        var oldScore = GetOldScoreOnly(latestBetStatus);
        if (string.IsNullOrEmpty(oldScore))
        {
            return betStatus;
        }
        var scoreFullTime = new StringBuilder();
        var statusList = oldScore.Split(',');
        if (statusList.Length >= totalHalfTimeSets + 1)
        {
            for (var j = totalHalfTimeSets; j < statusList.Length; j++)
            {
                scoreFullTime.Append(statusList[j]);
                scoreFullTime.Append(j == statusList.Length - 1 ? string.Empty : ",");
            }
        }

        if (!string.IsNullOrEmpty(scoreFullTime.ToString()))
        {
            betStatus.Append($",{scoreFullTime}");
        }

        return betStatus;
    }

    private static string GetOldScoreOnly(string latestBetStatus)
    {
        var scoreOnly = string.Empty;
        if (!string.IsNullOrEmpty(latestBetStatus))
        {
            scoreOnly = latestBetStatus.Contains(BetStatus.Refund) ? latestBetStatus.Remove(latestBetStatus.IndexOf('R'), latestBetStatus.IndexOf(';')).Trim(',', ';') : latestBetStatus;
        }

        return scoreOnly;
    }

    private static ScoreSetModel GetScore(CalculateRequest request)
    {
        var htResult = request.SelectedResources.Find(item => item.ResourceId == ResourceType.Halftime);
        var ftResult = request.SelectedResources.Find(item => item.ResourceId == ResourceType.Final);
        var scoreSet = new ScoreSetModel
        {
            BetStatus = new StringBuilder(),
            HtHomeScore = htResult != null && int.TryParse(htResult.HomeValue, out var value) ? value : 0,
            HtAwayScore = htResult != null && int.TryParse(htResult.AwayValue, out var value2) ? value2 : 0,
            FinalHomeScore = ftResult != null && int.TryParse(ftResult.HomeValue, out var value3) ? value3 : 0,
            FinalAwayScore = ftResult != null && int.TryParse(ftResult.AwayValue, out var value4) ? value4 : 0
        };

        return scoreSet;
    }
}