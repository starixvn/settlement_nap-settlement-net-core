namespace Settlement.Sportsbook.OtherSports.Services;

using AutoMapper;
using Criteria;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Requests;
using Settlement.Core.Models;

public interface SettlementActionsService
{
    Task<Result> Calculate(CalculateRequest request);

    Task<Result> CalculateWithResultDetail(CalculateRequest request);

    Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);
}

public class SettlementActionsServiceImp : SettlementActionsService
{
    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly IMapper mapper;

    private readonly GenerateService generateService;

    private readonly MultipleServerService multipleServerService;

    public SettlementActionsServiceImp(
        IHttpContextAccessor accessor,
        INapSession currentSession,
        IMapper mapper,
        GenerateService generateService,
        MultipleServerService multipleServerService)
    {
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.mapper = mapper;
        this.generateService = generateService;
        this.multipleServerService = multipleServerService;
    }

    public async Task<Result> Calculate(CalculateRequest request)
    {
        request.SelectedResources = generateService.GenerateFinalScore(request);
        var score = generateService.GenerateBetStatus(request);
        var criteria = CreateCriteria(request, request.BetStatus);
        return await multipleServerService.Calculate(criteria, score);
    }

    public async Task<Result> CalculateWithResultDetail(CalculateRequest request)
    {
        var score = generateService.GenerateBetStatus(request);
        var criteria = CreateCriteria(request, score.BetStatus.ToString());

        var result = await multipleServerService.Calculate(criteria, score);

        if (!result.IsSuccessful || request.HedgeMatchId <= 0)
        {
            return result;
        }
        criteria.MatchId = request.HedgeMatchId;
        await multipleServerService.Calculate(criteria, score);

        return result;
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
    {
        var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
        return await multipleServerService.CheckMarkedTickets(criteria);
    }

    private CalculateCriteria CreateCriteria(CalculateRequest request, string betStatus)
    {
        var calculate = new CalculateCriteria
        {
            AdminId = currentSession.UserId,
            MatchId = request.MatchId,
            Action = request.Action,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            RefResultStatus = request.RefResultStatus,
            SelectedResources = generateService.CreateResources(request.SelectedResources, request.Action),
            BetStatus = betStatus
        };

        return calculate;
    }
}