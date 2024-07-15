using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;

namespace Fanex.Settlement.ScaleOut.Services;

public interface ScaleOutSettleService
{
    Task UpdateAutoRefundChildMatch(RefundChildMatchRequest request);

    Task UpdateMatchInfo(UpdateMatchInfoRequest request);

    Task UpdateUnderSettlementFlag(int matchId, int adminId, string actionName);

    Task<ResultMessage> ValidateEventAndTicket(EventTicketRequest request);

    Task<ResultMessage> ValidateEventAndTicketFastMarket(EventTicketFastMarketRequest request);

    Task<int> GetSiteGroupId(string dbServer);
}

public class ScaleOutSettleServiceImp : ScaleOutSettleService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly IHttpContextAccessor accessor;

    private readonly GeneralService generalService;

    public ScaleOutSettleServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        IHttpContextAccessor accessor,
        GeneralService generalService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.accessor = accessor;
        this.generalService = generalService;
    }

    public async Task UpdateAutoRefundChildMatch(RefundChildMatchRequest request)
    {
        var leagueGroupIds = new[] { 42, 74, 108 };
        var isCalcAll = string.Equals(request.ActionName, ActionName.CalculateFullTime) ||
                        string.Equals(request.ActionName, ActionName.CalculateAll);

        if (DifferentFinalScore(request.HomeValue, request.AwayValue)
            && leagueGroupIds.Contains(request.LeagueGroupId)
            && isCalcAll)
        {
            var criteria = new UpdateAutoRefundChildMatchCriteria
            {
                ParentId = request.ParentId,
                ChildMatchIds = request.ChildMatchIds
            };

            await repository.ExecuteAsync(criteria);
        }
    }

    private static bool DifferentFinalScore(int? homeScore, int? awayScore)
    {
        var score = homeScore != awayScore;
        return homeScore != null && awayScore != null && score;
    }

    public async Task UpdateMatchInfo(UpdateMatchInfoRequest request)
    {
        var criteria = mapper.Map<UpdateMatchInfoRequest, UpdateMatchInfoCriteria>(request);
        await repository.ExecuteAsync(criteria);
    }

    public async Task UpdateUnderSettlementFlag(int matchId, int adminId, string actionName)
    {
        if (!string.Equals(actionName, ActionName.CalculateHalfTime) && !string.Equals(actionName, ActionName.RefundHalfTime))
        {
            const int settlementSystem = 4;
            var httpContext = accessor.HttpContext;
            var criteria = new UpdateSettlementStatusCriteria
            {
                MatchId = matchId,
                AdminId = adminId,
                Ip = httpContext == null ? string.Empty : httpContext.Connection.RemoteIpAddress.ToString(),
                Type = settlementSystem,
                IsEnabled = actionName != ActionName.Undo && actionName != ActionName.UndoFT
            };

            await repository.ExecuteAsync(criteria);
        }
    }

    public async Task<ResultMessage> ValidateEventAndTicket(EventTicketRequest request)
    {
        var eventCriteria = mapper.Map<EventTicketRequest, ValidateEventCriteria>(request);
        var validateEvent = await generalService.ExecuteSingle(eventCriteria);

        if (validateEvent.ErrorCode > 0)
        {
            return validateEvent;
        }

        var ticketCriteria = mapper.Map<EventTicketRequest, ValidateTicketCriteria>(request);
        return await generalService.ExecuteAsync(ticketCriteria);
    }

    public async Task<ResultMessage> ValidateEventAndTicketFastMarket(EventTicketFastMarketRequest request)
    {
        var eventCriteria = mapper.Map<EventTicketFastMarketRequest, ValidationEventFastMarketCriteria>(request);
        var validateEvent = await generalService.ExecuteSingle(eventCriteria);

        if (validateEvent.ErrorCode > 0)
        {
            return validateEvent;
        }

        var ticketCriteria = mapper.Map<EventTicketFastMarketRequest, ValidationTicketFastMarketCriteria>(request);
        return await generalService.ExecuteAsync(ticketCriteria);
    }

    public async Task<int> GetSiteGroupId(string dbServer)
    {
        var criteria = new GetSiteGroupCriteria { DbServer = dbServer };
        var site = await repository.GetAsync<SiteGroup>(criteria);
        return site.SiteDbGroupId;
    }
}