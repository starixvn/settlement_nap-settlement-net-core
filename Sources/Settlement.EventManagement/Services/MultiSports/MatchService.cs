using Fanex.Settlement.ScaleOut.Request;

namespace Settlement.EventManagement.Services.MultiSports;

using Fanex.Settlement.ScaleOut.Services;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Constants;
using Match = Models.MultiSports.Match;

public interface IMatchService
{
    List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false);

    void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches);

    Task<List<Match>> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail);

    Task UpdateMatchInfo(UpdateMatchInfoRequest request);

    List<Match> SortingMatches(List<Match> matches);
}

public class MatchServiceImp(
    IRefDataService refDataService,
    IMatchResultDetailService matchResultDetailService,
    CompareMatchService compareMatchService,
    NewInfoMatchService newInfoMatchService,
    ScaleOutSettleService scaleOutSettleService)
    : IMatchService
{
    public async Task<List<Match>> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail)
    {
        foreach (var match in matches)
        {
            var listSourceByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
            var currentResultDetail = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

            match.NewEventStatus = newInfoMatchService.NewEventStatus(match, currentResultDetail);
            match.EventStatusColor = newInfoMatchService.OSEventStatusColor(match);
            match.EarlySettleStatus = newInfoMatchService.EarlyOSSettlementStatus(match);
            match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Halftime);
            match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Final);
            match.IsExistsConfirmedEarly = newInfoMatchService.IsExistsConfirmedOSEarly(match);
            match.RefDataService = refDataService;
        }

        return await newInfoMatchService.GetAutoSetting(matches);
    }

    public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false)
    {
        return sportType switch
        {
            SportType.Tennis => matchResultDetailService.TennisResultDetail(matches, resultDetails, isLeader),
            SportType.BasketBall => matchResultDetailService.BasketballResultDetail(matches, resultDetails, isLeader),
            SportType.ESports => matchResultDetailService.ESportsResultDetail(matches, resultDetails, isLeader),
            SportType.Badminton => matchResultDetailService.BadmintonResultDetail(matches, resultDetails, isLeader),
            SportType.Cricket => matchResultDetailService.CricketResultDetail(matches, resultDetails, isLeader),
            SportType.BeachVolleyball => matchResultDetailService.BeachVolleyballResultDetail(matches, resultDetails,
                isLeader),
            SportType.VolleyBall => matchResultDetailService.VolleyballResultDetail(matches, resultDetails, isLeader),
            SportType.Bandy => matchResultDetailService.BandyResultDetail(matches, resultDetails, isLeader),
            _ => LoadExternalResults(matches, resultDetails, sportType)
        };
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

    public void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches)
    {
        foreach (var match in baseMatches)
        {
            var matchSiteInfo = compareMatchService.GetDifferentMatchSiteInfo(match, siteMatches);
            if (matchSiteInfo != null)
            {
                match.SiteMatch.Add(matchSiteInfo);
            }
        }
    }

    public async Task UpdateMatchInfo(UpdateMatchInfoRequest request)
    {
        await scaleOutSettleService.UpdateMatchInfo(request);
    }

    public List<Match> SortingMatches(List<Match> matches)
    {
        var sportBook = matches.OrderBy(match => !(match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && match.IsExistRunningTicket))
            .ThenBy(match => match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && !match.IsExistRunningTicket)
            .ThenBy(match => match.KickOffTime)
            .ThenBy(match => match.LeagueId)
            .ThenBy(match => match.SettlementStatus != 0)
            .ThenBy(match => match.MatchCode.ToLowerInvariant())
            .ToList();

        return sportBook;
    }
}