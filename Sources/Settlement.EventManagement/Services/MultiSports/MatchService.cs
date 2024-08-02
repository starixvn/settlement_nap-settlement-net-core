using Fanex.Settlement.ScaleOut.Request;

namespace Settlement.EventManagement.Services.MultiSports;

using Constants;
using Fanex.Settlement.ScaleOut.Services;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Models.MultiSports.Match;

public interface IMatchService
{
    List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false);

    void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches);

    Task<List<Match>> SetNewOsMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail);

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
    public async Task<List<Match>> SetNewOsMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail)
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
            match.RefDataService = refDataService;
        }

        return await newInfoMatchService.GetAutoSetting(matches);
    }

    public async Task<List<Match>> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail)
    {
        foreach (var match in matches)
        {
            var listSourceByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
            var currentResultDetail = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

            match.NewEventStatus = newInfoMatchService.NewEventStatus(match, currentResultDetail);
            match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
            match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
            match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Halftime);
            match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Final);
            match.IsExistsConfirmedEarly = newInfoMatchService.IsExistsConfirmedEarly(match);
            match.RefDataService = refDataService;
        }

        return await newInfoMatchService.GetAutoSetting(matches);
    }

    public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, bool isLeader = false)
    {
        switch (sportType)
        {
            case SportType.Tennis:
                return matchResultDetailService.TennisResultDetail(matches, resultDetails, isLeader);

            case SportType.BasketBall:
                return matchResultDetailService.BasketballResultDetail(matches, resultDetails, isLeader);

            case SportType.ESports:
                return matchResultDetailService.ESportsResultDetail(matches, resultDetails, isLeader);

            case SportType.Badminton:
                return matchResultDetailService.BadmintonResultDetail(matches, resultDetails, isLeader);

            case SportType.Cricket:
                return matchResultDetailService.CricketResultDetail(matches, resultDetails, isLeader);

            case SportType.BeachVolleyball:
                return matchResultDetailService.BeachVolleyballResultDetail(matches, resultDetails, isLeader);

            case SportType.VolleyBall:
                return matchResultDetailService.VolleyballResultDetail(matches, resultDetails, isLeader);

            case SportType.Bandy:
                return matchResultDetailService.BandyResultDetail(matches, resultDetails, isLeader);

            case SportType.TableTennis:
                return matchResultDetailService.TableTennisResultDetail(matches, resultDetails, isLeader);

            case SportType.BaseBall:
                return matchResultDetailService.BaseballResultDetail(matches, resultDetails, isLeader);

            default:
                return LoadExternalResults(matches, resultDetails, sportType);
        }
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