using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.Services;

using Core.Constants;
using MultipleServer;

public interface IMatchService
{
    List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport);

    List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches);

    void SetNewMatchInfo(List<Match> matches);
}

public class MatchServiceImp(
    IMatchResultDetailService matchResultDetailService,
    IRefDataService refDataService,
    CompareMatchService compareMatchService,
    NewInfoMatchService newInfoMatchService)
    : IMatchService
{
    public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport)
    {
        if (sportType == SportType.Cricket)
        {
            return matchResultDetailService.CricketResultDetail(matches, resultDetails);
        }

        if (sportType == SportType.BaseBall)
        {
            return matchResultDetailService.BaseballResultDetail(matches, resultDetails);
        }

        foreach (var result in matches)
        {
            result.RefDataService = refDataService;
            result.GroupSport = groupSport;
        }

        return matches;
    }

    public void SetNewMatchInfo(List<Match> matches)
    {
        foreach (var match in matches)
        {
            match.NewEventStatus = newInfoMatchService.NewEventStatus(match);
            match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
            match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
            match.RefDataService = refDataService;
        }
    }

    public List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches)
    {
        var peekNewMatches = siteMatches.Except(baseMatches).ToList();
        baseMatches.AddRange(peekNewMatches);
        AddSiteInfo(baseMatches, siteMatches);

        return baseMatches;
    }

    private void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches)
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
}