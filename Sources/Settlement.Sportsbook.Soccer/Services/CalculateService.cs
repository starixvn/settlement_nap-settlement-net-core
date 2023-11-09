using Settlement.Core.Constants;
using Settlement.Core.Criteria;
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

    Task<Result> UncalculateFt(UncalculateFtRequest request);

    Task<Result> CheckStatus(CheckStatusRequest request);
}

public class CalculateServiceImp : ICalculateService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly AppSettingsKey appSettingsKey;

    private readonly ICreateCriteriaService createCriteriaService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly LogService logService;

    public CalculateServiceImp(
        IMapper mapper,
        IDynamicRepository repository,
        IOptions<AppSettingsKey> appSettingsKey,
        ICreateCriteriaService createCriteriaService,
        ScaleOutSettleService scaleOutSettleService,
        LogService logService)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.mapper = mapper;
        this.createCriteriaService = createCriteriaService;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logService = logService;
    }

    public async Task<Result> Calculate(SettleRequest request)
    {
        var criteria = createCriteriaService.CreateCalculateCriteria(request);
        var matchChecking = await ValidateBeforeExecute(criteria);
        if (matchChecking.ErrCode > 0)
        {
            return matchChecking;
        }

        var match = CreatedMatch(criteria);
        var insertLogCriteria = createCriteriaService.CreateCalculateLogCriteria(request);

        await WriteLog(match, insertLogCriteria);

        await ExecuteAsync(criteria);

        await RefundChildMatch(criteria);

        if (request.IsApplyHedging)
        {
            criteria.MatchId = request.HedgeMatchId;
            await ExecuteAsync(criteria);
        }

        return matchChecking;
    }

    public async Task<Result> UncalculateFt(UncalculateFtRequest request)
    {
        var criteria = createCriteriaService.CreateUnCalculateFtCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        var match = CreatedMatch(criteria, request.ResultDetails);
        var insertLogCriteria = createCriteriaService.CreateUnCalculateFtLogCriteria(request);
        await WriteLog(match, insertLogCriteria);

        await ExecuteAsync(criteria);

        if (request.IsApplyHedging)
        {
            criteria.MatchId = request.HedgeMatchId;
            await ExecuteAsync(criteria);
        }

        return requestChecking;
    }

    public async Task<Result> UnCalculate(SettleRequest request)
    {
        var criteria = createCriteriaService.CreateUnCalculateCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        var match = CreatedMatch(criteria);
        var insertLogCriteria = createCriteriaService.CreateUnCalculateLogCriteria(request);

        await WriteLog(match, insertLogCriteria);

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

    private async Task WriteLog(Match match, InsertLogCriteria insertLogCriteria)
    {
        await logService.WriteLog(insertLogCriteria);

        var messageLog = $"NAP:Calculate({insertLogCriteria.Action}) for matchId: {match.MatchId} score: "
                         + $"{match.FinalHomeScore ?? 0}-{match.FinalAwayScore ?? 0} HT: {match.HalfTimeHomeScore ?? 0}-{match.HalfTimeAwayScore ?? 0} "
                         + $"GoalRecord: {match.GoalRecord} Remark({match.BetStatus})";
        await logService.WriteLog(match.MatchId, messageLog);
    }

    private Match CreatedMatch(CalculateCriteria criteria)
    {
        return new Match
        {
            MatchId = criteria.MatchId,
            HalfTimeAwayScore = criteria.HalfTimeAway,
            HalfTimeHomeScore = criteria.HalfTimeHome,
            FinalAwayScore = criteria.FullTimeAway ?? 0,
            FinalHomeScore = criteria.FullTimeHome ?? 0,
            GoalRecord = criteria.GoalRecord,
            BetStatus = criteria.BetStatus
        };
    }

    private Match CreatedMatch(CalculateCriteria criteria, IEnumerable<ResultDetail> resultDetails)
    {
        var resultHalfTime = resultDetails?.FirstOrDefault(result => result.ResourceId == ResourceType.Halftime) ?? new ResultDetail();
        return new Match
        {
            MatchId = criteria.MatchId,
            GoalRecord = criteria.GoalRecord,
            BetStatus = criteria.BetStatus,
            HalfTimeHomeScore = string.IsNullOrEmpty(resultHalfTime.HomeValue) ? 0 : int.Parse(resultHalfTime.HomeValue),
            HalfTimeAwayScore = string.IsNullOrEmpty(resultHalfTime.AwayValue) ? 0 : int.Parse(resultHalfTime.AwayValue)
        };
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