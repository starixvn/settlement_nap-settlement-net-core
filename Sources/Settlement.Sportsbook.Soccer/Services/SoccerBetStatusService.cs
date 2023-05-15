using AutoMapper;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

using GetMatch;

public interface ISoccerBetStatusService
{
    string CreateBetStatus(SettleRequest request);

    string CreateBetStatusAfterUncalculateFt(UncalculateFtRequest request, string betStatus, string goalRecord);
}

public class SoccerBetStatusServiceImp : ISoccerBetStatusService
{
    private readonly IMatchService matchService;
    private readonly IValidationService validationService;
    private readonly IBetStatusAllService betStatusAllService;
    private readonly FullTimeBetStatus.IBetStatusService fullTimeBetStatusService;
    private readonly HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService;
    private readonly IMapper mapper;

    private const string RefundHalfTime = "Refund HT;";

    public SoccerBetStatusServiceImp(
        IMatchService matchService,
        IValidationService validationService,
        HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService,
        FullTimeBetStatus.IBetStatusService fullTimeBetStatusService,
        IBetStatusAllService betStatusAllService,
        IMapper mapper)
    {
        this.matchService = matchService;
        this.validationService = validationService;
        this.halfTimeBetStatusService = halfTimeBetStatusService;
        this.fullTimeBetStatusService = fullTimeBetStatusService;
        this.betStatusAllService = betStatusAllService;
        this.mapper = mapper;
    }

    public string CreateBetStatus(SettleRequest request)
    {
        request.BetStatus = matchService.GetBetStatus(request.MatchId);

        if (validationService.IsExistFirstGoalLastGoal(request))
        {
            return request.ActionName switch
            {
                ActionType.CalculateHalfTime => halfTimeBetStatusService.GetBetStatus(request),
                ActionType.CalculateFullTime => fullTimeBetStatusService.GetBetStatus(request),
                _ => betStatusAllService.GetBetStatus(request)
            };
        }

        return validationService.IsRefundHalftime(request) || validationService.IsRefundFullTime(request) ? request.BetStatus : string.Empty;
    }

    public string CreateBetStatusAfterUncalculateFt(UncalculateFtRequest request, string betStatus, string goalRecord)
    {
        var halfTime = request.ResultDetails.FirstOrDefault(item => item.ResourceId == ResourceType.Halftime);
        if (halfTime is null or { SettlementStatusId: 0 })
        {
            return string.Empty;
        }

        if (halfTime.SettlementStatusId == SettlementStatus.RefundHt)
        {
            return RefundHalfTime;
        }

        if (request.IsExistFgLg || request.IsExistHtFgLg || request.IsExistFgNg)
        {
            return RevertBetStatusHalfTime(request, goalRecord, halfTime);
        }

        return string.Empty;
    }

    private string RevertBetStatusHalfTime(UncalculateFtRequest request, string goalRecord, ResultDetail halfTimeResult)
    {
        var settleBaseRequest = mapper.Map<SettleBaseRequest>(request);
        settleBaseRequest.HalfTimeAwayScore = string.IsNullOrEmpty(halfTimeResult.AwayValue) ? 0 : int.Parse(halfTimeResult.AwayValue);
        settleBaseRequest.HalfTimeHomeScore = string.IsNullOrEmpty(halfTimeResult.HomeValue) ? 0 : int.Parse(halfTimeResult.HomeValue);
        settleBaseRequest.GoalRecord = goalRecord;
        settleBaseRequest.BetStatus = string.Empty;
        return halfTimeBetStatusService.GetBetStatus(settleBaseRequest);
    }
}