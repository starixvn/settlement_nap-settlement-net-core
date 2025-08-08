using Fanex.Settlement.MessageBridge.JackTime;
using Fanex.Settlement.MessageBridge.RefundEvents;
using Fanex.Settlement.ScaleOut.Criteria.Update;
using Mapster;
using MassTransit;
using Settlement.Core.Configurations;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services.GetMatch;
using FantasyRelatedMatch = Settlement.Sportsbook.Soccer.Models.FantasyRelatedMatch;

namespace Settlement.Sportsbook.Soccer.Services;

public interface ICalculateService
{
    Task<Result> Calculate(SettleRequest request);

    Task<Result> UnCalculate(SettleRequest request);

    Task<Result> UncalculateFt(UncalculateFtRequest request);

    Task<Result> CheckStatus(CheckStatusRequest request);

    Task<Result> SaveScore(SaveScoreRequest request);

    Task<Result> SaveOutsideScore(SaveOutsideScoreRequest request);
}

public class CalculateServiceImp(
    IMapper mapper,
    IDynamicRepository repository,
    IOptions<AppSettingsKey> appSettingsKey,
    ICreateCriteriaService createCriteriaService,
    CalculateServiceDependencies dependencies) : ICalculateService
{
    private readonly ScaleOutSettleService scaleOutSettleService = dependencies.ScaleOutSettleService;
    private readonly LogService logService = dependencies.LogService;
    private readonly IMatchService matchService = dependencies.MatchService;
    private readonly IPublishEndpoint publishEndpoint = dependencies.PublishEndpoint;
    private readonly INapSession napSession = dependencies.NapSession;
    private readonly IHttpContextAccessor accessor = dependencies.Accessor;
    private readonly XmlConvertService xmlConvertService = dependencies.XmlConvertService;

    public async Task<Result> Calculate(SettleRequest request)
    {
        var criteria = createCriteriaService.CreateCalculateCriteria(request);
        var validationResult = await ValidateBeforeExecute(criteria);

        if (validationResult.ErrCode > 0)
        {
            return validationResult;
        }

        await SaveOutsideScores(request);

        var validateFantasyMatchResult = await ValidateFantasyMatch(request);
        if (validateFantasyMatchResult.ErrCode > 0)
        {
            return validateFantasyMatchResult;
        }

        var match = CreatedMatch(criteria);
        var logCriteria = createCriteriaService.CreateCalculateLogCriteria(request);
        var ticketCriteria = createCriteriaService.SoccerGetTicketInfoCriteria(criteria);

        await WriteLog(match, logCriteria);
        await ExecuteAsync(criteria);
        await RefundChildMatches(criteria);

        if (request.IsApplyHedging)
        {
            await ExecuteHedging(criteria, request.HedgeMatchId);
        }


        await publishEndpoint.Publish(new MatchCalculated(
            request.MatchId,
            request.ParentId,
            request.SportType,
            request.ChildMatchType,
            request.HalfTimeHomeScore,
            request.HalfTimeAwayScore,
            request.FinalHomeScore,
            request.FinalAwayScore,
            request.ActionName), new CancellationTokenSource(TimeSpan.FromSeconds(2)).Token);
        await PublishJackTimeRequest(ticketCriteria);


        return validationResult;
    }

    private async Task ExecuteHedging(CalculateCriteria criteria, int hedgeMatchId)
    {
        criteria.MatchId = hedgeMatchId;
        await ExecuteAsync(criteria);
    }

    private async Task SaveOutsideScores(SettleRequest request)
    {
        var outsideScores = request.SelectedResultDetails.SelectMany(r => r.ExternalScores).Where(s => s.SourceId >= SourceType.Screenshot);

        var criteria = new SaveOutsideScoreCriteria
        {
            MatchId = request.MatchId,
            UserId = napSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            OutsideSources = CreateScoreResources(outsideScores.Adapt<List<SaveScoreModel>>()),
            Sources = CreateScoreResources(request.SelectedResultDetails.Adapt<List<SaveScoreModel>>()),
        };

        await repository.ExecuteAsync(criteria);
    }

    private string CreateScoreResources(List<SaveScoreModel> selectedResources)
    {
        var resources = new SaveScoreResources<SaveScoreModel>
        {
            SourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    public async Task<Result> SaveOutsideScore(SaveOutsideScoreRequest request)
    {
        var ignoreProviderScores = request.ScoresToSave.Where(s => s.SourceId >= SourceType.Screenshot);
        var criteria = new SaveOutsideScoreCriteria
        {
            MatchId = request.MatchId,
            UserId = napSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            OutsideSources = CreateScoreResources(ignoreProviderScores.ToList()),
            Sources = CreateScoreResources(request.CheckedScores)
        };

        await repository.ExecuteAsync(criteria);
        return new Result(criteria.ErrCode, criteria.ErrMsg);
    }
    public async Task<Result> UncalculateFt(UncalculateFtRequest request)
    {
        var criteria = createCriteriaService.CreateUnCalculateFtCriteria(request);
        var validationResult = await ValidateBeforeExecute(criteria);
        if (validationResult.ErrCode > 0)
        {
            return validationResult;
        }

        var match = CreatedMatch(criteria, request.ResultDetails);
        var logCriteria = createCriteriaService.CreateUnCalculateFtLogCriteria(request);
        var ticketCriteria = createCriteriaService.SoccerGetTicketInfoCriteria(criteria);

        await WriteLog(match, logCriteria);
        await ExecuteAsync(criteria);

        if (request.IsApplyHedging)
        {
            await ExecuteHedging(criteria, request.HedgeMatchId);
        }

        await PublishJackTimeRequest(ticketCriteria);

        return validationResult;
    }

    public async Task<Result> UnCalculate(SettleRequest request)
    {
        var criteria = createCriteriaService.CreateUnCalculateCriteria(request);
        var validationResult = await ValidateBeforeExecute(criteria);
        if (validationResult.ErrCode > 0)
        {
            return validationResult;
        }

        var match = CreatedMatch(criteria);
        var logCriteria = createCriteriaService.CreateUnCalculateLogCriteria(request);
        var ticketCriteria = createCriteriaService.SoccerGetTicketInfoCriteria(criteria);

        await WriteLog(match, logCriteria);
        await ExecuteAsync(criteria);

        if (request.IsApplyHedging)
        {
            await ExecuteHedging(criteria, request.HedgeMatchId);
        }

        await PublishJackTimeRequest(ticketCriteria);

        return validationResult;
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

    private async Task<Result> ValidateFantasyMatch(SettleRequest request)
    {
        if (!request.isFantasyMatch)
        {
            return new Result();
        }

        var fantasyMatch = await matchService.GetRelatedMatches(request.MatchId);
        var relatedMatches = fantasyMatch.RelatedMatches;

        if (IsRelatedMatches(request.ActionName, relatedMatches))
        {
            return new Result
            {
                ErrCode = ErrorCode.ParentFantasyNotCalc,
                ErrMsg = ErrorMessage.ParentFantasyNotCalc
            };
        }

        return new Result();
    }

    private static bool IsRelatedMatches(string actionName, List<FantasyRelatedMatch> relatedMatches)
    {
        return IsFirstHalfRelatedMatchesNotCalc(actionName, relatedMatches)
               || IsFullTimeRelatedMatchesNotCalc(actionName, relatedMatches)
               || IsAllRelatedMatchesNotCalc(actionName, relatedMatches);
    }

    private static bool IsFirstHalfRelatedMatchesNotCalc(string action, IEnumerable<FantasyRelatedMatch> relatedMatches)
        => action.Equals(ActionName.CalculateHalfTime, StringComparison.Ordinal)
            && relatedMatches.Any(x => x.HtSettlementStatusId != SettlementStatus.Completed);

    private static bool IsFullTimeRelatedMatchesNotCalc(string action, IEnumerable<FantasyRelatedMatch> relatedMatches)
        => action.Equals(ActionName.CalculateFullTime, StringComparison.Ordinal)
            && relatedMatches.Any(x => x.FtSettlementStatusId != SettlementStatus.Completed);

    private static bool IsAllRelatedMatchesNotCalc(string action, List<FantasyRelatedMatch> relatedMatches)
        => action.Equals(ActionName.CalculateAll, StringComparison.Ordinal)
            && (IsFirstHalfRelatedMatchesNotCalc(ActionName.CalculateHalfTime, relatedMatches)
                || IsFullTimeRelatedMatchesNotCalc(ActionName.CalculateFullTime, relatedMatches));

    private async Task ExecuteAsync(CalculateCriteria criteria)
    {
        await UpdateMatchInfo(criteria);

        var tasks = appSettingsKey.Value.SiteDbServer.Select(async server =>
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        });

        await Task.WhenAll(tasks);
    }

    private async Task WriteLog(Match match, InsertLogCriteria insertLogCriteria)
    {
        await logService.WriteLog(insertLogCriteria);

        var messageLog = $"NAP:Calculate({insertLogCriteria.Action}) for matchId: {match.MatchId} score: "
                         + $"{match.FinalHomeScore ?? 0}-{match.FinalAwayScore ?? 0} HT: {match.HalfTimeHomeScore ?? 0}-{match.HalfTimeAwayScore ?? 0} "
                         + $"GoalRecord: {match.GoalRecord} Remark({match.BetStatus})";
        await logService.WriteLog(match.MatchId, messageLog);
    }

    private static Match CreatedMatch(CalculateCriteria criteria)
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

    private static Match CreatedMatch(CalculateCriteria criteria, IEnumerable<ResultDetail> resultDetails)
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
        var request = createCriteriaService.CreateEventTicketRequest(criteria);
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

    private async Task RefundChildMatches(CalculateCriteria criteria)
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

    public async Task<Result> SaveScore(SaveScoreRequest request)
    {
        var criteria = createCriteriaService.CreateSaveScoreCriteria(request);

        await repository.ExecuteAsync(criteria);

        if (criteria.ErrCode == 0)
        {
            const int actionLog = 81059;
            var message = CreateMessageSaveScore(request);
            await logService.ActionLog(request.MatchId, message, actionLog);
            await UpdateResult(criteria, request);
            return new Result();
        }

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private async Task UpdateResult(SaveScoreCriteria saveScoreCriteria, SaveScoreRequest request)
    {
        var criteria = new UpdateMatchInfoCriteria
        {
            MatchId = saveScoreCriteria.MatchId,
            Action = SettlementFunctionKeys.SaveScore,
            AdminId = saveScoreCriteria.UserId,
            GoalRecord = request.GoalRecord
        };

        foreach (var result in request.ResultDetails)
        {
            switch (result.ResourceId)
            {
                case ResourceType.Final:
                    criteria.FullTimeHome = int.Parse(result.HomeValue);
                    criteria.FullTimeAway = int.Parse(result.AwayValue);
                    break;

                case ResourceType.Halftime:
                    criteria.HalfTimeHome = int.Parse(result.HomeValue);
                    criteria.HalfTimeAway = int.Parse(result.AwayValue);
                    break;

                default: continue;
            }
        }

        await repository.ExecuteAsync(criteria);
    }

    private static string CreateMessageSaveScore(SaveScoreRequest request)
    {
        var strings = request.ResultDetails.Select(r => $"{(r.ResourceId == ResourceType.Final ? "FT" : "HT")}({r.HomeValue}-{r.AwayValue})").ToList();

        return string.Join(",<br/>", strings);
    }

    private async Task PublishJackTimeRequest(SoccerGetTicketInfoCriteria criteria)
    {
        var request = mapper.Map<SoccerGetTicketInfoCriteria, SoccerResult>(criteria);
        await publishEndpoint.Publish(request, new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
    }
}

public class CalculateServiceDependencies
{
    public ScaleOutSettleService ScaleOutSettleService { get; }
    public LogService LogService { get; }
    public IMatchService MatchService { get; }
    public IPublishEndpoint PublishEndpoint { get; }
    public INapSession NapSession { get; }
    public IHttpContextAccessor Accessor { get; }
    public XmlConvertService XmlConvertService { get; }

    public CalculateServiceDependencies(
        ScaleOutSettleService scaleOutSettleService,
        LogService logService,
        IMatchService matchService,
        IPublishEndpoint publishEndpoint,
        INapSession napSession,
        IHttpContextAccessor accessor,
        XmlConvertService xmlConvertService)
    {
        ScaleOutSettleService = scaleOutSettleService;
        LogService = logService;
        MatchService = matchService;
        PublishEndpoint = publishEndpoint;
        NapSession = napSession;
        Accessor = accessor;
        XmlConvertService = xmlConvertService;
    }
}