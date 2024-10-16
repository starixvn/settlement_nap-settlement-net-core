using Fanex.NAP.Client;
using Settlement.Sportsbook.OtherSports.Models;
using System.Text;

namespace Settlement.Sportsbook.OtherSports.Services;

using AutoMapper;
using Criteria;
using Microsoft.AspNetCore.Http;
using Requests;
using Settlement.Core.Models;

public interface SettlementActionsService
{
    Task<Result> Calculate(CalculateRequest request);

    Task<Result> CalculateWithResultDetail(CalculateRequest request);

    Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);
}

public class SettlementActionsServiceImp(
    IHttpContextAccessor accessor,
    INapSession currentSession,
    IMapper mapper,
    GenerateService generateService,
    MultipleServerService multipleServerService)
    : SettlementActionsService
{
    public async Task<Result> Calculate(CalculateRequest request)
    {
        request.SelectedResources = generateService.GenerateResources(request);
        var score = new ScoreSetModel
        {
            BetStatus = new StringBuilder(request.BetStatus),
            HtAwayScore = request.HalfTimeAwayScore,
            HtHomeScore = request.HalfTimeHomeScore,
            FinalAwayScore = request.FinalAwayScore,
            FinalHomeScore = request.FinalHomeScore
        };
        var criteria = CreateCriteria(request, request.BetStatus);
        return await Settle(request, criteria, score);
    }

    public async Task<Result> CalculateWithResultDetail(CalculateRequest request)
    {
        var score = generateService.GenerateBetStatus(request);
        var criteria = CreateCriteria(request, score.BetStatus.ToString());

        return await Settle(request, criteria, score);
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
    {
        var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
        return await multipleServerService.CheckMarkedTickets(criteria);
    }

    private async Task<Result> Settle(CalculateRequest request, CalculateCriteria criteria, ScoreSetModel score)
    {
        var result = await multipleServerService.Calculate(criteria, score);

        if (!result.IsSuccessful || request.HedgeMatchId <= 0)
        {
            return result;
        }
        criteria.MatchId = request.HedgeMatchId;
        criteria.IsHedgeMatch = true;
        await multipleServerService.Calculate(criteria, score);

        return result;
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
            BetStatus = betStatus,
            SportType = request.SportType
        };

        return calculate;
    }
}