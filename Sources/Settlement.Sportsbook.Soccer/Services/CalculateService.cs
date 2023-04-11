using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

public interface ICalculateService
{
    Task<Result> Calculate(SettleRequest request);

    Task<Result> UnCalculate(SettleRequest request);

    Task<Result> UncalculateFT(UncalculateFtRequest request);

    Task<Result> CheckStatus(CheckStatusRequest request);
}

public class CalculateServiceImp : ICalculateService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly AppSettingsKey appSettingsKey;

    private readonly ICreateCriteriaService createQueryCriteria;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly LogDirectlyService logDirectlyService;

    public CalculateServiceImp
    (IMapper mapper,
        IDynamicRepository repository,
        IOptions<AppSettingsKey> appSettingsKey,
        ICreateCriteriaService createQueryCriteria,
        ScaleOutSettleService scaleOutSettleService,
        LogDirectlyService logDirectlyService)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.mapper = mapper;
        this.createQueryCriteria = createQueryCriteria;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logDirectlyService = logDirectlyService;
    }

    public async Task<Result> Calculate(SettleRequest request)
    {
        var criteria = createQueryCriteria.CreateCalculateCriteria(request);
        var matchChecking = await ValidateBeforeExecute(criteria);
        if (matchChecking.ErrCode > 0)
        {
            return matchChecking;
        }

        WriteDirectlyLog(request);

        await ExecuteAsync(criteria);
        await RefundChildMatch(criteria);

        if (request.IsApplyHedging)
        {
            criteria.MatchId = request.HedgeMatchId;
            await ExecuteAsync(criteria);
        }

        return matchChecking;
    }

    public async Task<Result> UncalculateFT(UncalculateFtRequest request)
    {
        var criteria = createQueryCriteria.CreateUnCalculateFtCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        WriteDirectlyLogUncalculateFt(criteria, request.ResultDetails);

        await ExecuteAsync(criteria);

        return new Result();
    }

    public async Task<Result> UnCalculate(SettleRequest request)
    {
        var criteria = createQueryCriteria.CreateUnCalculateCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        WriteDirectlyLog(request);

        await ExecuteAsync(criteria);

        if (request.IsApplyHedging)
        {
            criteria.MatchId = request.HedgeMatchId;
            await ExecuteAsync(criteria);
        }

        return requestChecking;
    }

    public async Task<Result> CheckStatus(CheckStatusRequest request)
    {
        var criteria = mapper.Map<CheckStatusRequest, CheckStatusCriteria>(request);

        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private async Task ExecuteAsync(CalculateCriteria criteria)
    {
        await UpdateMatchInfo(criteria);
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private void WriteDirectlyLog(SettleBaseRequest request)
    {
        var match = new Match
        {
            MatchId = request.MatchId,
            HalfTimeAwayScore = request.HalfTimeAwayScore,
            HalfTimeHomeScore = request.HalfTimeHomeScore,
            FinalAwayScore = request.FinalAwayScore,
            FinalHomeScore = request.FinalHomeScore,
            GoalRecord = request.GoalRecord,
            BetStatus = request.BetStatus,
        };

        var message = LogDirectlyServiceImp.GenerateLogData(match, request.ActionName);

        logDirectlyService.WriteLog(request.MatchId, message);
    }

    private void WriteDirectlyLogUncalculateFt(CalculateCriteria criteria, IEnumerable<ResultDetail> resultDetails)
    {
        var resultHalfTime = resultDetails.FirstOrDefault(result => result.ResourceId == ResourceType.Halftime) ?? new ResultDetail();
        var match = new Match
        {
            MatchId = criteria.MatchId,
            GoalRecord = criteria.GoalRecord,
            BetStatus = criteria.BetStatus,
            HalfTimeHomeScore = string.IsNullOrEmpty(resultHalfTime.HomeValue) ? 0 : int.Parse(resultHalfTime.HomeValue),
            HalfTimeAwayScore = string.IsNullOrEmpty(resultHalfTime.AwayValue) ? 0 : int.Parse(resultHalfTime.AwayValue),
        };

        var message = LogDirectlyServiceImp.GenerateLogData(match, ActionType.UnCalculateFullTime);

        logDirectlyService.WriteLog(criteria.MatchId, message);
    }

    private async Task<Result> ValidateBeforeExecute(CalculateCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = ActionKey.ActionDictionary[criteria.Action],
            ResourceResult = criteria.ResourceResult
        };
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);

        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(CalculateCriteria criteria)
    {
        await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            BetStatus = criteria.BetStatus,
            FullTimeAway = criteria.FullTimeAway,
            FullTimeHome = criteria.FullTimeHome,
            GoalRecord = criteria.GoalRecord,
            HalfTimeAway = criteria.HalfTimeAway,
            HalfTimeHome = criteria.HalfTimeHome,
            ResourceResult = criteria.ResourceResult
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }

    private async Task RefundChildMatch(CalculateCriteria criteria)
    {
        var requestRefundChildMatch = new RefundChildMatchRequest
        {
            ParentId = criteria.MatchId,
            ChildMatchIds = criteria.ChildMatchIds,
            LeagueGroupId = criteria.LeagueGroupId,
            AwayValue = criteria.FullTimeAway,
            HomeValue = criteria.FullTimeHome,
            ActionName = criteria.Action
        };

        await scaleOutSettleService.UpdateAutoRefundChildMatch(requestRefundChildMatch);
    }
}