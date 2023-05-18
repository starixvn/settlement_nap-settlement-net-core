using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;

namespace Settlement.Sportsbook.Soccer.Services;

public interface InstantCalculateService
{
    Task<MatchGoalRecordModel> CalculateCheckingInfo(MatchCheckingRequest request);

    Task<UndoCheckingModel> UndoCheckingScore(int matchId);

    Task<Result> PushInstantCalculation(InstantCalculationRequest request);
}

public class InstantCalculateServiceImp : InstantCalculateService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly IHttpContextAccessor accessor;

    private readonly IInstantResourceService instantResourceService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly LogService logService;

    private readonly AppSettingsKey appSettingsKey;

    public InstantCalculateServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        IHttpContextAccessor accessor,
        IInstantResourceService instantResourceService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService,
        LogService logService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.accessor = accessor;
        this.instantResourceService = instantResourceService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logService = logService;
    }

    public async Task<MatchGoalRecordModel> CalculateCheckingInfo(MatchCheckingRequest request)
    {
        var criteria = mapper.Map<MatchCheckingRequest, InstantCheckingCriteria>(request);
        var matchGoalRecord = new MatchGoalRecordModel();
        var firstMatch = true;
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var matchChecking = await repository.GetAsync<MatchGoalRecordModel>(criteria);
            if (criteria.ErrCode > 0)
            {
                matchChecking.ErrCode = criteria.ErrCode;
                matchChecking.ErrMsg = criteria.ErrMsg;

                return matchChecking;
            }

            MergeData(matchGoalRecord, matchChecking, firstMatch);
            firstMatch = false;
        }

        return matchGoalRecord;
    }

    public async Task<UndoCheckingModel> UndoCheckingScore(int matchId)
    {
        var criteria = new UndoCheckingCriteria { MatchId = matchId };
        var undoCheckingScore = await repository.GetAsync<UndoCheckingModel>(criteria);
        undoCheckingScore.ErrCode = criteria.ErrCode;
        undoCheckingScore.ErrMsg = criteria.ErrMsg;
        await GetTicketInfo(matchId, undoCheckingScore);
        return undoCheckingScore;
    }

    public async Task<Result> PushInstantCalculation(InstantCalculationRequest request)
    {
        var criteria = mapper.Map<InstantCalculationRequest, PushInstantCalculationCriteria>(request);
        criteria.ResourceResult = GetResourceResultInstantCalculate(request);
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        var result = await ValidateBeforeExecute(request);
        if (result.IsSuccessful)
        {
            await UpdateResult(request);
            await UpdateMatchInfo(request, request.IsHalfTime, criteria.ResourceResult);
            await Execute(criteria);
        }

        return result;
    }

    private async Task GetTicketInfo(int matchId, UndoCheckingModel model)
    {
        var criteria = new InstantTicketCheckingCriteria { MatchId = matchId };
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var matchChecking = await repository.GetAsync<MatchGoalRecordModel>(criteria);

            model.IsExistFG = model.IsExistFG || matchChecking.IsExistFG;
            model.IsExistHTFG = model.IsExistHTFG || matchChecking.IsExistHTFG;
        }
    }

    private string BetStatus(InstantCalculationRequest request)
    {
        var betStatus = request.BetStatus ?? string.Empty;
        if (request.Action.Equals(ActionType.UnCalculate))
        {
            if (request.HomeScore == "0" && request.AwayScore == "0")
            {
                betStatus = instantResourceService.RemoveBetStatus(request);
            }
        }
        else
        {
            betStatus += request.IsHalfTime ? instantResourceService.BetStatusHtFl(request, betStatus) : string.Empty;
            betStatus += instantResourceService.BetStatusFl(request, betStatus);
        }

        return betStatus;
    }

    private static void MergeData(MatchGoalRecordModel baseMatch, MatchGoalRecordModel siteMatch, bool isBaseMatch)
    {
        if (isBaseMatch)
        {
            baseMatch.GoalRecord = siteMatch.GoalRecord;
            baseMatch.BetStatus = siteMatch.BetStatus;
        }

        baseMatch.IsExistFgNg = baseMatch.IsExistFgNg || siteMatch.IsExistFgNg;
        baseMatch.IsExistHtFgNg = baseMatch.IsExistHtFgNg || siteMatch.IsExistHtFgNg;
        baseMatch.IsExistFG = baseMatch.IsExistFG || siteMatch.IsExistFG;
        baseMatch.IsExistHTFG = baseMatch.IsExistHTFG || siteMatch.IsExistHTFG;
    }

    private async Task Execute(PushInstantCalculationCriteria criteria)
    {
        WriteLogDirectly(criteria);

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private void WriteLogDirectly(PushInstantCalculationCriteria criteria)
    {
        var score = $"{criteria.HomeScore}-{criteria.AwayScore}";
        var message = $"NAP: Instant Uncalculate {criteria.Mode} for matchId: {criteria.MatchId} Score: {score} Instant action: {criteria.Mode}";
        logService.WriteLog(criteria.MatchId, message);
    }

    private string GetResourceResultInstantCalculate(InstantCalculationRequest request)
    {
        var goalCondition = new InstantGoalCondition
        {
            GoalRecord = request.GoalRecord,
            FirstGoalValue = request.FirstGoalValue,
            IsExistFgNg = request.IsExistFgNg,
            IsExistHtFgNg = request.IsExistHtFgNg,
            IsHalfTime = request.IsHalfTime
        };

        List<XmlResource> resources;

        if (request.HomeScore == "0" && request.AwayScore == "0" && !request.Action.Equals(ActionType.UnCalculate))
        {
            return string.Empty;
        }

        if (request.Action.Equals(ActionType.UnCalculate))
        {
            resources = instantResourceService.UnCalculate(goalCondition);
        }
        else if (request.IsHalfTime)
        {
            resources = instantResourceService.Halftime(goalCondition);
        }
        else
        {
            resources = instantResourceService.FullTime(goalCondition);
        }

        return instantResourceService.GenerateResource(resources);
    }

    private async Task<Result> ValidateBeforeExecute(InstantCalculationRequest request)
    {
        var requestChecking = new EventTicketRequest
        {
            MatchId = request.MatchId,
            Action = request.Action,
            SpName = "NAP_Admin_Settlement_1_InstantCalculation_Push",
            IsAuto = false,
            Mode = request.Mode,
            InstantKey = request.InstantKey
        };
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(requestChecking);

        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(InstantCalculationRequest request, bool isHalfTime, string resourceResult)
    {
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            MatchId = request.MatchId,
            Action = request.Action,
            AdminId = request.AdminId,
            ResourceResult = resourceResult,
            IsAuto = false,
            Mode = request.Mode,
            BetStatus = BetStatus(request)
        };

        if (isHalfTime)
        {
            requestUpdateInfo.HalfTimeHome = int.Parse(request.HomeScore);
            requestUpdateInfo.HalfTimeAway = int.Parse(request.AwayScore);
        }
        else
        {
            requestUpdateInfo.FullTimeHome = int.Parse(request.HomeScore);
            requestUpdateInfo.FullTimeAway = int.Parse(request.AwayScore);
        }

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }

    private async Task UpdateResult(InstantCalculationRequest request)
    {
        if (request.Action.Equals(ActionType.CalculateAll))
        {
            var updateResultCriteria = new AddAutoResultCriteria
            {
                MatchId = request.MatchId,
                HomeValue = int.Parse(request.HomeScore),
                AwayValue = int.Parse(request.AwayScore),
                InstantKey = request.InstantKey,
                StatusId = 1,
                TypeId = request.IsHalfTime ? InstantCalculationType.CalcHt : InstantCalculationType.CalcFt,
                ChildMatchType = request.ChildMatchType
            };

            await repository.ExecuteAsync(updateResultCriteria);
        }
    }
}