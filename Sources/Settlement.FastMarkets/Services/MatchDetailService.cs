using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.Services;

public interface IMatchDetailService
{
    Task<MatchDetail> MatchInfo(int matchId);

    Task<MarkedTickets> CheckingMarkedTickets(CheckingMarkedTicketsRequest request);
}

public class MatchDetailServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    GoalIconService goalIconService,
    IFastMarketResultService fastMarketResultService,
    IOptions<AppSettingsKey> appSettingsKey)
    : IMatchDetailService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<MatchDetail> MatchInfo(int matchId)
    {
        var criteria = new GetMatchDetailCriteria { MatchId = matchId };
        var matchDetail = await repository.GetAsync<MatchDetail>(criteria);

        matchDetail.RefDataService = refDataService;

        var goalIconQuery = GoalIconQuery(matchDetail);
        matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

        return matchDetail;
    }

    private static GoalIconQueryModel GoalIconQuery(MatchDetail match)
    {
        var finalHomeScore = match.FinalHomeScore.Equals("-") ? 0 : Convert.ToInt32(match.FinalHomeScore);
        var finalAwayScore = match.FinalAwayScore.Equals("-") ? 0 : Convert.ToInt32(match.FinalAwayScore);

        return new GoalIconQueryModel
        {
            BetStatus = match.BetStatus,
            GoalRecord = match.GoalRecord,
            FinalAwayScore = finalAwayScore,
            FinalHomeScore = finalHomeScore,
            IsExistFgLg = match.IsExistFgLg,
            IsExistHtFgLg = match.IsExistHtFgLg
        };
    }

    public async Task<MarkedTickets> CheckingMarkedTickets(CheckingMarkedTicketsRequest request)
    {
        var results = fastMarketResultService.Result(request.BetTypes, string.Empty);
        var criteria = new CheckingMarkedTicketsCriteria { MatchId = request.MatchId, Results = results.Result };
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var markedTicket = await repository.GetAsync<MarkedTickets>(criteria);
            if (markedTicket.IsExistMarkedTicket)
            {
                return markedTicket;
            }
        }

        return new MarkedTickets();
    }
}