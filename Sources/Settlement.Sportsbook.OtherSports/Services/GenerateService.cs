namespace Settlement.Sportsbook.OtherSports.Services;

using System.Collections.Generic;
using System.Text;
using Constants;
using Criteria;
using Fanex.Data.Repository;
using Fanex.Settlement.Converter.Services;
using Models;
using Requests;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using ResourceItem = Core.Models.ResourceItem;

public interface GenerateService
{
    public ScoreSetModel GenerateBetStatus(CalculateRequest request);

    public List<ResultDetail> GenerateResultDetail(MatchDetail matchDetail);

    public string CreateResources(CalculateRequest request);

    public List<ResourceItem> GenerateResources(CalculateRequest request);
}

public class GenerateServiceImp(IDynamicRepository repository, XmlConvertService xmlConvertService)
    : GenerateService
{
    private const int FootballHtNode = 2;

    private static readonly List<string> HalfTimeAction = [ActionType.RefundHalfTime, ActionType.CalculateHalfTime];

    private static readonly List<string> FullTimeAction = [ActionType.RefundFullTime, ActionType.CalculateFullTime];

    private static readonly List<string> AllAction = [ActionType.UnCalculate, ActionType.CalculateAll, ActionType.RefundAll];

    private static readonly List<string> ResetValueActions =
    [
        ActionType.UnCalculate, ActionType.UnCalculateFullTime,
        ActionType.RefundHalfTime, ActionType.RefundFullTime, ActionType.RefundAll
    ];

    public string CreateResources(CalculateRequest request)
    {
        var resources = new Resources<ResourceItem>
        {
            ResourceItems = []
        };

        AddHalfTimeResourceIfApplicable(request, resources);
        AddFullTimeResourceIfApplicable(request, resources);

        return xmlConvertService.Serialize(resources);
    }

    private static void AddHalfTimeResourceIfApplicable(CalculateRequest request, Resources<ResourceItem> resources)
    {
        var halfTime = request.SelectedResources.Find(item => item.ResourceId == ResourceType.Halftime);

        if (halfTime is null)
        {
            return;
        }

        var shouldAddHalfTime = HalfTimeAction.Contains(request.Action) ||
                               HalfTimeFulltimeGroup(request.SportType, request.Action);

        if (shouldAddHalfTime)
        {
            var resourceToAdd = CreateResourceWithResetValues(halfTime, request.Action);
            resources.ResourceItems.Add(resourceToAdd);
        }
    }

    private static bool HalfTimeFulltimeGroup(int sportType, string action)
    {
        var halfTimeAndFulltime = !GroupSport.OnlyFullTime.Contains(sportType) && !GroupSport.Squash.Contains(sportType);
        return halfTimeAndFulltime && !FullTimeAction.Contains(action);
    }

    private static void AddFullTimeResourceIfApplicable(CalculateRequest request, Resources<ResourceItem> resources)
    {
        var fullTime = request.SelectedResources.Find(item => item.ResourceId == ResourceType.Final);

        if (fullTime is null)
        {
            return;
        }

        if (AllAction.Contains(request.Action) || FullTimeAction.Contains(request.Action))
        {
            var resourceToAdd = CreateResourceWithResetValues(fullTime, request.Action);
            resources.ResourceItems.Add(resourceToAdd);
        }
    }

    private static ResourceItem CreateResourceWithResetValues(ResourceItem originalResource, string action)
    {
        var resource = new ResourceItem(originalResource.ResourceId)
        {
            HomeValue = originalResource.HomeValue,
            AwayValue = originalResource.AwayValue
        };

        if (ResetValueActions.Contains(action))
        {
            resource.HomeValue = string.Empty;
            resource.AwayValue = string.Empty;
        }

        return resource;
    }

    public ScoreSetModel GenerateBetStatus(CalculateRequest request)
    {
        var betStatus = GetBetStatus(request.MatchId);
        if (request.IsScoreDirect)
        {
            return GetScore(request);
        }

        return request.Action == ActionType.CalculateHalfTime
            ? GetHalfTimeScore(request.SelectedResources, betStatus)
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

    private static string GetResourceId(int currentIndex, int maxSetNumber, int sportType)
    {
        return !GroupSport.Squash.Contains(sportType) && currentIndex + 1 == maxSetNumber ? "OT" : $"{currentIndex + 1}";
    }

    private static int SetNumber(int sportType)
    {
        const int footBallGroup = 5;
        const int hockeyGroup = 4;

        if (GroupSport.FootBall.Contains(sportType) || GroupSport.Squash.Contains(sportType))
        {
            return footBallGroup;
        }

        return hockeyGroup;
    }

    private static Score ScoreItemOnBetStatus(IReadOnlyList<string> betStatus, int currentIndex)
    {
        if (!IsValidBetStatusItem(betStatus, currentIndex))
        {
            return new Score();
        }

        var scoreText = betStatus[currentIndex].Trim();
        return ParseScoreFromText(scoreText);
    }

    private static bool IsValidBetStatusItem(IReadOnlyList<string> betStatus, int currentIndex)
    {
        return betStatus.Count > currentIndex &&
               betStatus[currentIndex].Trim().IndexOf('-') >= 1;
    }

    private static Score ParseScoreFromText(string scoreText)
    {
        var scoreParts = scoreText.Split('-');
        return new Score(scoreParts[0], scoreParts[1]);
    }

    private static List<ResultDetail> CreateResultFinal(MatchDetail matchDetail, List<ResultDetail> resultDetails)
    {
        if (GroupSport.FootBall.Contains(matchDetail.SportType))
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
        if (string.IsNullOrWhiteSpace(betStatus))
        {
            return [];
        }

        return HasSemicolonSeparator(betStatus)
            ? ExtractScoresAfterSemicolon(betStatus)
            : betStatus.Split(',');
    }

    private static bool HasSemicolonSeparator(string betStatus)
    {
        const int minimumParts = 2;
        var parts = betStatus.Split(';');
        return parts.Length >= minimumParts;
    }

    private static string[] ExtractScoresAfterSemicolon(string betStatus)
    {
        var parts = betStatus.Split(';');
        return parts[1].Split(',');
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

    private static ScoreSetModel GetHalfTimeScore(IReadOnlyList<ResourceItem> resources, string latestBetStatus)
    {
        var (htHomeScore, htAwayScore) = CalculateHalfTimeScores(resources);
        var betStatus = BuildBetStatusHalfTime(resources);

        betStatus = ProcessBetStatus(betStatus, latestBetStatus, FootballHtNode);
        AddRefundPrefixIfNeeded(betStatus, latestBetStatus);

        return new ScoreSetModel
        {
            BetStatus = betStatus,
            HtHomeScore = htHomeScore,
            HtAwayScore = htAwayScore
        };
    }

    private static (int HomeScore, int AwayScore) CalculateHalfTimeScores(IReadOnlyList<ResourceItem> resources)
    {
        var homeScore = 0;
        var awayScore = 0;

        for (var i = 0; i < FootballHtNode; i++)
        {
            homeScore += GetSafeScoreValue(resources[i].HomeValue);
            awayScore += GetSafeScoreValue(resources[i].AwayValue);
        }

        return (homeScore, awayScore);
    }

    private static StringBuilder BuildBetStatusHalfTime(IReadOnlyList<ResourceItem> resources)
    {
        var scoreStrings = new List<string>();

        for (var i = 0; i < FootballHtNode; i++)
        {
            scoreStrings.Add($"{resources[i].HomeValue}-{resources[i].AwayValue}");
        }

        return new StringBuilder(string.Join(",", scoreStrings));
    }

    private static void AddRefundPrefixIfNeeded(StringBuilder betStatus, string latestBetStatus)
    {
        if (!string.IsNullOrEmpty(latestBetStatus) && latestBetStatus.Contains($"{BetStatus.RefundFt};"))
        {
            betStatus.Insert(0, $"{BetStatus.RefundFt};");
        }
    }

    private static ScoreSetModel GetFullTimeScore(List<ResourceItem> resources, int sportType)
    {
        var resourceSet = FilterValidResources(resources);
        var scores = CalculateScoresFromResources(resourceSet);
        var betStatus = BuildBetStatusFullTime(resourceSet);

        SetFinalScoreForSquashTemplate(resources, sportType, ref scores.HtHomeScore, ref scores.HtAwayScore, ref scores.FinalHomeScore, ref scores.FinalAwayScore);

        var scoreSet = new ScoreSetModel
        {
            BetStatus = betStatus,
            HtHomeScore = scores.HtHomeScore,
            HtAwayScore = scores.HtAwayScore,
            FinalHomeScore = scores.FinalHomeScore,
            FinalAwayScore = scores.FinalAwayScore
        };

        return OverTime(scoreSet, resources);
    }

    private static List<ResourceItem> FilterValidResources(List<ResourceItem> resources)
    {
        return resources.Where(item => item.ResourceId != ResourceType.Final
                                      && item.ResourceId != ResourceType.Halftime
                                      && item.ResourceId != "OT").ToList();
    }

    private static (int HtHomeScore, int HtAwayScore, int FinalHomeScore, int FinalAwayScore) CalculateScoresFromResources(List<ResourceItem> resourceSet)
    {
        var htHomeScore = 0;
        var htAwayScore = 0;
        var finalHomeScore = 0;
        var finalAwayScore = 0;

        for (var i = 0; i < resourceSet.Count; i++)
        {
            var home = GetSafeScoreValue(resourceSet[i].HomeValue);
            var away = GetSafeScoreValue(resourceSet[i].AwayValue);

            finalHomeScore += home;
            finalAwayScore += away;

            if (i == FootballHtNode - 1)
            {
                htHomeScore = finalHomeScore;
                htAwayScore = finalAwayScore;
            }
        }

        return (htHomeScore, htAwayScore, finalHomeScore, finalAwayScore);
    }

    private static StringBuilder BuildBetStatusFullTime(List<ResourceItem> resourceSet)
    {
        var betStatus = new StringBuilder();
        var scoreStrings = resourceSet.Select(resource =>
            $"{GetSafeScoreValue(resource.HomeValue)}-{GetSafeScoreValue(resource.AwayValue)}");

        betStatus.Append(string.Join(",", scoreStrings));
        return betStatus;
    }

    private static int GetSafeScoreValue(string value)
    {
        return string.IsNullOrEmpty(value) ? 0 : int.Parse(value);
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

        var fullTimeScores = ExtractFullTimeScores(oldScore, totalHalfTimeSets);
        if (!string.IsNullOrEmpty(fullTimeScores))
        {
            betStatus.Append($",{fullTimeScores}");
        }

        return betStatus;
    }

    private static string ExtractFullTimeScores(string oldScore, int totalHalfTimeSets)
    {
        var statusList = oldScore.Split(',');
        if (statusList.Length < totalHalfTimeSets + 1)
        {
            return string.Empty;
        }

        var fullTimeScores = new List<string>();
        for (var i = totalHalfTimeSets; i < statusList.Length; i++)
        {
            fullTimeScores.Add(statusList[i]);
        }

        return string.Join(",", fullTimeScores);
    }

    private static string GetOldScoreOnly(string latestBetStatus)
    {
        if (string.IsNullOrEmpty(latestBetStatus))
        {
            return string.Empty;
        }

        return latestBetStatus.Contains(BetStatus.Refund)
            ? RemoveRefundPrefix(latestBetStatus)
            : latestBetStatus;
    }

    private static string RemoveRefundPrefix(string betStatus)
    {
        var refundIndex = betStatus.IndexOf('R');
        var semicolonIndex = betStatus.IndexOf(';');
        return betStatus.Remove(refundIndex, semicolonIndex).Trim(',', ';');
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