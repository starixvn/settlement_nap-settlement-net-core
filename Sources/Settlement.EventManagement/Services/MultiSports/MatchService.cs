namespace Settlement.EventManagement.Services.MultiSports;

using Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Models.MultiSports.Match;

public interface IMatchService
{
    List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false);

    Task<List<Match>> SetNewOsMatchInfo(List<Match> matches, List<ResultDetail> resultDetails);

    List<Match> SortingMatches(List<Match> matches);
}

public class MatchServiceImp(
    IRefDataService refDataService,
    IMatchResultDetailService matchResultDetailService,
    NewInfoMatchService newInfoMatchService)
    : IMatchService
{
    public async Task<List<Match>> SetNewOsMatchInfo(List<Match> matches, List<ResultDetail> resultDetails)
    {
        foreach (var match in matches)
        {
            var sourceResults = GetResultsBySource(resultDetails, match.MatchId);
            UpdateMatchOsInfo(match, sourceResults.normalResults, sourceResults.otherResults);
        }

        return await newInfoMatchService.GetAutoSetting(matches);
    }

    private static (List<ResultDetail> normalResults, List<ResultDetail> otherResults) GetResultsBySource(List<ResultDetail> resultDetails, long matchId)
    {
        var matchResults = resultDetails.Where(m => m.MatchId == matchId);
        return (
            matchResults.Where(m => m.SourceId == SourceType.Normal).ToList(),
            matchResults.Where(m => m.SourceId != SourceType.Normal).ToList()
        );
    }

    private void UpdateMatchOsInfo(
        Match match,
        List<ResultDetail> currentResults,
        List<ResultDetail> otherSourceResults)
    {
        match.NewEventStatus = newInfoMatchService.NewEventStatus(match, currentResults);
        match.EventStatusColor = newInfoMatchService.OSEventStatusColor(match);
        match.EarlySettleStatus = newInfoMatchService.EarlyOSSettlementStatus(match);
        match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(otherSourceResults, ResourceType.Halftime);
        match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(otherSourceResults, ResourceType.Final);
        match.RefDataService = refDataService;
    }

    public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false)
    {
        var sportTypeMappings = new Dictionary<int, Func<List<Match>, List<ResultDetail>, bool, List<Match>>>
        {
            { SportType.Tennis, matchResultDetailService.TennisResultDetail },
            { SportType.BasketBall, matchResultDetailService.BasketballResultDetail },
            { SportType.ESports, matchResultDetailService.ESportsResultDetail },
            { SportType.Badminton, matchResultDetailService.BadmintonResultDetail },
            { SportType.Cricket, matchResultDetailService.CricketResultDetail },
            { SportType.BeachVolleyball, matchResultDetailService.BeachVolleyballResultDetail },
            { SportType.VolleyBall, matchResultDetailService.VolleyballResultDetail },
            { SportType.Bandy, matchResultDetailService.BandyResultDetail },
            { SportType.TableTennis, matchResultDetailService.TableTennisResultDetail },
            { SportType.BaseBall, matchResultDetailService.BaseballResultDetail }
        };

        if (sportTypeMappings.TryGetValue(sportType, out var resultDetailFunc))
        {
            return resultDetailFunc(matches, resultDetails, isLeader);
        }

        return LoadExternalResults(matches, resultDetails, sportType);
    }

    private List<Match> LoadExternalResults(List<Match> matches, List<ResultDetail> resultDetails, int sportType)
    {
        if (Sports.FullTimeSports.Contains(sportType))
        {
            return matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, false);
        }

        if (Sports.HalfTimeFullTimeSports.Contains(sportType))
        {
            return matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, true);
        }

        matches.ForEach(match => match.RefDataService = refDataService);

        return matches;
    }

    public List<Match> SortingMatches(List<Match> matches)
    {
        var sportBook = matches
            .OrderBy(match => !IsCompletedWithRunningTicket(match))
            .ThenBy(IsCompletedWithoutRunningTicket)
            .ThenBy(match => match.KickOffTime)
            .ThenBy(match => match.LeagueId)
            .ThenBy(match => match.SettlementStatus != 0)
            .ThenBy(match => match.MatchCode.ToLowerInvariant())
            .ToList();

        return sportBook;
    }

    private static bool IsCompletedWithRunningTicket(Match match) =>
        string.Equals(match.OriginalEventStatus.ToLowerInvariant(), EventStatus.Completed) &&
        match.IsExistRunningTicket;

    private static bool IsCompletedWithoutRunningTicket(Match match) =>
        string.Equals(match.OriginalEventStatus.ToLowerInvariant(), EventStatus.Completed) &&
                      !match.IsExistRunningTicket;
}