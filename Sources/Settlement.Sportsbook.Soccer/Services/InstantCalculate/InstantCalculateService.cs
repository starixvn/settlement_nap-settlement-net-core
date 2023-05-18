using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using MatchCheckingCriteria = Settlement.Sportsbook.Soccer.Criteria.MatchCheckingCriteria;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate;

public interface InstantCalculateService
{
    Task<UndoCheckingModel> UndoCheckingScore(int matchId);

    Task<Result> PushInstantCalculation(InstantCalculationRequest request);

    Task<Result> UncalPushInstantCalculation(InstantCalculationRequest request);
}

public class InstantCalculateServiceImp : InstantCalculateService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly InstantResourceService instantResourceService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly PushInstantCalculationService pushInstantService;

    private readonly AppSettingsKey appSettingsKey;

    public InstantCalculateServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        InstantResourceService instantResourceService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService,
        PushInstantCalculationService pushInstantService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.instantResourceService = instantResourceService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.pushInstantService = pushInstantService;
    }

    private async Task<MatchCheckingResult> CalculateCheckingInfo(MatchCheckingCriteria criteria)
    {
        var matchCheckingResult = new MatchCheckingResult();

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);

            if (criteria.ErrCode > 0)
            {
                matchCheckingResult.ErrCode = criteria.ErrCode;
                matchCheckingResult.ErrMsg = criteria.ErrMsg;

                return matchCheckingResult;
            }
        }

        return matchCheckingResult;
    }

    public async Task<UndoCheckingModel> UndoCheckingScore(int matchId)
    {
        var criteria = new UndoCheckingCriteria { MatchId = matchId };
        var (undoChecking, calculatedResources) = await repository.FetchMultipleAsync<UndoCheckingModel, XmlResource>(criteria);

        var undoCheckingScore = undoChecking.FirstOrDefault() ?? new UndoCheckingModel();

        undoCheckingScore.ErrCode = criteria.ErrCode;
        undoCheckingScore.ErrMsg = criteria.ErrMsg;
        undoCheckingScore.Resources = calculatedResources.ToList();

        return undoCheckingScore;
    }

    public async Task<Result> UncalPushInstantCalculation(InstantCalculationRequest request)
    {
        var matchTicketInfo = await GetMatchDetailWithTicketInfo(request.MatchId);
        request.IsExistHtFgNg = matchTicketInfo.IsExistHtFgNg;
        request.IsExistFgNg = matchTicketInfo.IsExistFgNg;
        request.IsExistFG = matchTicketInfo.IsExistFG;
        request.IsExistHTFG = matchTicketInfo.IsExistHTFG;
        request.IsExistCorner = matchTicketInfo.IsExistCorner;
        request.IsExistHTCorner = matchTicketInfo.IsExistHTCorner;
        request.IsExistFirstCorner = matchTicketInfo.IsExistFirstCorner;
        request.IsExistHTFirstCorner = matchTicketInfo.IsExistHTFirstCorner;
        request.IsExist2HFirstCorner = matchTicketInfo.IsExist2HFirstCorner;

        var uncalResources = GetResourcesInstantCalculate(request);
        var resourceResult = GetResourceResultInstantUncal(request.Resources, uncalResources);

        var result = await ProcessPushInstantCalculation(request, resourceResult);

        return result;
    }

    public async Task<Result> PushInstantCalculation(InstantCalculationRequest request)
    {
        var matchTicketInfo = await GetMatchDetailWithTicketInfo(request.MatchId);

        request.GoalRecord = matchTicketInfo.GoalRecord;
        request.BetStatus = matchTicketInfo.BetStatus;
        request.IsExistHtFgNg = matchTicketInfo.IsExistHtFgNg;
        request.IsExistFgNg = matchTicketInfo.IsExistFgNg;
        request.IsExistFG = matchTicketInfo.IsExistFG;
        request.IsExistHTFG = matchTicketInfo.IsExistHTFG;
        request.IsExistCorner = matchTicketInfo.IsExistCorner;
        request.IsExistHTCorner = matchTicketInfo.IsExistHTCorner;
        request.IsExistFirstCorner = matchTicketInfo.IsExistFirstCorner;
        request.IsExistHTFirstCorner = matchTicketInfo.IsExistHTFirstCorner;
        request.IsExist2HFirstCorner = matchTicketInfo.IsExist2HFirstCorner;

        var resources = GetResourcesInstantCalculate(request);
        var resourceResult = instantResourceService.GenerateResource(resources);

        var resultMatchChecking = await CheckCalculationMatch(request, resourceResult);
        if (resultMatchChecking.ErrCode > 0)
        {
            return resultMatchChecking;
        }

        var result = await ProcessPushInstantCalculation(request, resourceResult);

        return result;
    }

    private async Task<Result> ProcessPushInstantCalculation(InstantCalculationRequest request, string resourceResult)
    {
        var criteria = mapper.Map<InstantCalculationRequest, PushInstantCalculationCriteria>(request);
        criteria.ResourceResult = resourceResult;
        criteria.Action = $"{request.Action}-{request.Mode}";

        var result = await ValidateBeforeExecute(request);

        if (result.IsSuccessful)
        {
            await UpdateResult(request);
            await UpdateMatchInfo(request, request.IsHalfTime, criteria.ResourceResult);
            await pushInstantService.Execute(criteria);
        }

        return result;
    }

    private async Task<Result> CheckCalculationMatch(InstantCalculationRequest request, string resourceResult)
    {
        var matchCheckingCriteria = new MatchCheckingCriteria
        {
            MatchId = request.MatchId,
            Action = $"{request.Action}-{request.Mode}",
            AwayScore = request.AwayScore,
            HomeScore = request.HomeScore,
            InstantKey = request.InstantKey,
            ResourceResult = resourceResult,
        };
        var matchCheckingResult = await CalculateCheckingInfo(matchCheckingCriteria);

        return new Result
        {
            ErrCode = matchCheckingResult.ErrCode,
            ErrMsg = matchCheckingResult.ErrMsg
        };
    }

    private async Task<MatchTicketInfo> GetMatchDetailWithTicketInfo(int matchId)
    {
        var matchDetail = await GetMatchDetailInfo(matchId);
        var ticketInfo = await GetMatchTicketInfo(matchId);

        ticketInfo.GoalRecord = matchDetail.GoalRecord;
        ticketInfo.BetStatus = matchDetail.BetStatus;

        return ticketInfo;
    }

    private async Task<MatchDetail> GetMatchDetailInfo(int matchId)
    {
        var criteria = new GetMatchInfoCriteria
        {
            MatchId = matchId
        };

        var match = await repository.GetAsync<MatchDetail>(criteria);

        return match;
    }

    private async Task<MatchTicketInfo> GetMatchTicketInfo(int matchId)
    {
        var listTicketInfo = new List<MatchTicketInfo>();
        var criteria = new MatchTicketInfoCriteria
        {
            MatchId = matchId,
        };

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var item = await repository.GetAsync<MatchTicketInfo>(criteria) ?? new MatchTicketInfo();
            listTicketInfo.Add(item);
        }

        return new MatchTicketInfo
        {
            IsExistFgNg = listTicketInfo.Exists(item => item.IsExistFgNg),
            IsExistHtFgNg = listTicketInfo.Exists(item => item.IsExistHtFgNg),
            IsExistFG = listTicketInfo.Exists(item => item.IsExistFG),
            IsExistHTFG = listTicketInfo.Exists(item => item.IsExistHTFG),
            IsExistCorner = listTicketInfo.Exists(item => item.IsExistCorner),
            IsExist2HFirstCorner = listTicketInfo.Exists(item => item.IsExist2HFirstCorner),
            IsExistFirstCorner = listTicketInfo.Exists(item => item.IsExistFirstCorner),
            IsExistHTCorner = listTicketInfo.Exists(item => item.IsExistHTCorner),
            IsExistHTFirstCorner = listTicketInfo.Exists(item => item.IsExistHTFirstCorner),
        };
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

    private string GetResourceResultInstantUncal(List<XmlResource> calculatedResources, List<XmlResource> uncalResources)
    {
        var resourcesId = uncalResources.Select(r => r.ResourceId).ToList();
        var resources = calculatedResources
            .Where(resource => !resourcesId.Contains(resource.ResourceId))
            .Select(resource => new XmlResource
            {
                ResourceId = resource.ResourceId,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }).ToList();
        return instantResourceService.GenerateResource(resources);
    }

    private List<XmlResource> GetResourcesInstantCalculate(InstantCalculationRequest request)
    {
        var goalCondition = mapper.Map<InstantGoalCondition>(request);

        if (request.HomeScore == "0" && request.AwayScore == "0" || string.IsNullOrEmpty(request.GoalRecord))
        {
            return new List<XmlResource>();
        }

        var resources = request.IsHalfTime
            ? instantResourceService.Halftime(goalCondition)
            : instantResourceService.FullTime(goalCondition);

        return resources;
    }

    private async Task<Result> ValidateBeforeExecute(InstantCalculationRequest request)
    {
        var requestChecking = new EventTicketRequest
        {
            MatchId = request.MatchId,
            Action = $"{request.Action}-{request.Mode}",
            SpName = "NAP_Admin_Settlement_InstantCalculation_Push",
            IsAuto = false,
            Mode = null,
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
            AdminId = request.AdminId,
            Action = $"{request.Action}-{request.Mode}",
            ResourceResult = resourceResult,
            IsAuto = false,
            Mode = null,
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