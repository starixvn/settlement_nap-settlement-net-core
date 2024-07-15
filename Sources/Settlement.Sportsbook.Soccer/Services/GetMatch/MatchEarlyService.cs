namespace Settlement.Sportsbook.Soccer.Services.GetMatch;

using Fanex.NAP.Client.Helpers.Common;
using AutoMapper;
using Criteria;
using Fanex.Data.Repository;
using Models;
using Settlement.Core.Services;
using MatchDetail = Models.MatchDetail;
using Settlement.Core.Models;
using Settlement.Core.Services.SpecificService;

public interface MatchEarlyService
{
    Task<MatchEarly> GetMatch(int matchId);
}

public class MatchEarlyServiceImp(
    IDynamicRepository repository,
    PermissionService permissionService,
    IMapper mapper,
    IRefDataService refDataService,
    GoalIconService goalIconService,
    EarlyBetTypeNameService earlyBetTypeNameService,
    IFetchDataService fetchDataService)
    : MatchEarlyService
{
    public async Task<MatchEarly> GetMatch(int matchId)
    {
        var criteria = new GetMatchDetailEarlyCriteria { MatchId = matchId };
        var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
        Check.Argument.IsNotNull(matchDetail, $"Match ${matchId} does not exist");

        matchDetail.RefDataService = refDataService;

        var goalIconQuery = mapper.Map<MatchDetail, GoalIconQueryModel>(matchDetail);
        matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

        var resultDetailCriteria = new GetResultDetailEarlyCriteria { MatchId = matchId };
        var fetchedResultDetails = await repository.FetchAsync<ResultDetailModel>(resultDetailCriteria);
        var (firstResultSet, ticketCount) = await fetchDataService.GetEarlyTicketDetails(resultDetailCriteria);
        var resultDetail = fetchedResultDetails.ToList();
        MergeEarlyTicketsToResults(resultDetail, firstResultSet);

        resultDetail = MappingBetTypeName(resultDetail);

        var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = matchId };
        var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

        resultDetail = resultDetail.OrderBy(result => result.OrdNo).ToList();

        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);

        var confirmRefundCriteria = new GetResultConfirmRefundCriteria { MatchId = matchId };
        var externalResults = (await repository.FetchAsync<ExternalResultDetailModel>(confirmRefundCriteria)).ToList();

        return new MatchEarly
        {
            MatchDetail = matchDetail,
            ResultDetail = resultDetail,
            TicketCounts = ticketCount,
            Permission = permission,
            HedgeMatchDetail = hedgeMatchDetail,
            ExternalResults = externalResults
        };
    }

    private static void MergeEarlyTicketsToResults(List<ResultDetailModel> resultDetails, List<ResultDetailModel> ticketDetails)
    {
        var newTicketDetails = ticketDetails.Where(ticketDetail => !resultDetails.Exists(result => result.Equals(ticketDetail)));
        resultDetails.AddRange(newTicketDetails);

        GenerateTicketsStatus(resultDetails, ticketDetails);
    }

    private static void GenerateTicketsStatus(List<ResultDetailModel> results, List<ResultDetailModel> ticketDetails)
    {
        foreach (var result in results)
        {
            var ticketDetail = ticketDetails.Find(detail => detail.ResourceId == result.ResourceId);
            var betType = result.ResourceId[..3];
            result.TicketStatus = CreateTicketStatus(ticketDetail, betType);
        }
    }

    private static string CreateTicketStatus(ResultDetailModel ticketDetail, string betType)
    {
        var specialBetTypes = new List<string> { BetType.SoccerBetType.AwayPenaltyShootout.ToString(), BetType.SoccerBetType.HomePenaltyShootout.ToString() };

        if (ticketDetail == null)
        {
            return specialBetTypes.Contains(betType) ? TicketStatus.NoTicket : TicketStatus.NotIncludedOnSoccer;
        }

        if (ticketDetail.InRunning > 0)
        {
            return TicketStatus.Running;
        }

        if (ticketDetail.InWaiting > 0 && ticketDetail.InWaiting == ticketDetail.BetCount)
        {
            return TicketStatus.Waiting;
        }

        if (ticketDetail.BetMarkedCount > 0)
        {
            return TicketStatus.Marked;
        }

        if (specialBetTypes.Contains(betType) && ticketDetail.BetCount == 0)
        {
            return TicketStatus.NoTicket;
        }

        return TicketStatus.Calculated;
    }

    private List<ResultDetailModel> MappingBetTypeName(List<ResultDetailModel> list)
    {
        const int maxResource = 3;
        var listEarly = list.Where(x => x.ResourceId.Length >= maxResource && x.TicketStatus != TicketStatus.NotIncludedOnSoccer).ToList();
        foreach (var item in listEarly)
        {
            var resourceId = item.ResourceId;
            var betType = resourceId[..maxResource];
            var betTypeId = Convert.ToInt32(betType);
            item.BetType = betType;
            item.Map = earlyBetTypeNameService.GetGroupMap(betTypeId, resourceId);
            item.BetTypeName = earlyBetTypeNameService.GetBetTypeName(betTypeId, resourceId);
        }

        return listEarly;
    }
}