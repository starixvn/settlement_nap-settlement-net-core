using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Threading.Tasks;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Services;

public interface SettlementActionsService
{
    Task<Result> Calculate(CalculateRequest request);

    Task<Result> CalculateWithResultDetail(CalculateRequest request);

    Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);

    Task<Result> Refund(RefundRequest request);

    Task<Result> RefundParlay(RefundParlayRequest request);
}

public class SettlementActionsServiceImp : SettlementActionsService
{
    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly IMapper mapper;

    private readonly IBetStatusService betStatusService;

    private readonly MultipleServerService multipleServerService;

    public SettlementActionsServiceImp(
        IDynamicRepository repository,
        IHttpContextAccessor accessor,
        INapSession currentSession,
        IMapper mapper,
        IBetStatusService betStatusService,
        MultipleServerService multipleServerService)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.mapper = mapper;
        this.betStatusService = betStatusService;
        this.multipleServerService = multipleServerService;
    }

    public async Task<Result> Calculate(CalculateRequest request)
    {
        var criteria = mapper.Map<CalculateRequest, CalculateCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        return await multipleServerService.Calculate(criteria);
    }

    public async Task<Result> CalculateWithResultDetail(CalculateRequest request)
    {
        var criteria = CreateCriteria(request);

        var result = await multipleServerService.Calculate(criteria);

        if (result.IsSuccessful && request.HedgeMatchId > 0)
        {
            criteria.MatchId = request.HedgeMatchId;
            await multipleServerService.Calculate(criteria);
        }

        return result;
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
    {
        var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
        return await multipleServerService.CheckMarkedTickets(criteria);
    }

    public async Task<Result> Refund(RefundRequest request)
    {
        var criteria = mapper.Map<RefundRequest, RefundCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        var result = await multipleServerService.Refund(criteria);
            
        if (result.ErrCode == 0 && request.HedgeMatchId > 0)
        {
            criteria.MatchId = request.HedgeMatchId;
            await multipleServerService.Refund(criteria);
        }

        return result;
    }

    public async Task<Result> RefundParlay(RefundParlayRequest request)
    {
        var criteria = mapper.Map<RefundParlayRequest, ParlayCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        var result = await multipleServerService.RefundParlay(criteria);

        if (result.ErrCode == 0 && request.HedgeMatchId > 0)
        {
            criteria.MatchId = request.HedgeMatchId;
            await multipleServerService.RefundParlay(criteria);
        }

        return result;
    }

    private CalculateCriteria CreateCriteria(CalculateRequest request)
    {
        var score = betStatusService.GenerateBetStatus(request);

        var calculate = new CalculateCriteria
        {
            AdminId = currentSession.UserId,
            MatchId = request.MatchId,
            BetStatus = score.BetStatus.ToString(),
            Action = request.Action,
            HalfTimeHome = score.HtHomeScore ?? 0,
            HalfTimeAway = score.HtAwayScore ?? 0,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            RefResultStatus = request.RefResultStatus
        };

        if (request.Action.Equals(ActionType.CalculateFullTime) || request.Action.Equals(ActionType.CalculateAll))
        {
            calculate.FullTimeHome = score.FinalHomeScore ?? 0;
            calculate.FullTimeAway = score.FinalAwayScore ?? 0;
        }

        return calculate;
    }
}