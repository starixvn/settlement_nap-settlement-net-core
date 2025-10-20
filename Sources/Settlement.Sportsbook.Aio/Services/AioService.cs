using Fanex.Settlement.MessageBridge.RefundEvents;
using MassTransit;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Basketball;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using StackExchange.Redis;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;
using ResultTicket = (System.Collections.Generic.List<Settlement.Sportsbook.Aio.Models.ResultDetail> ResultDetails
    , Settlement.Core.Models.TicketCounts TicketCounts);

namespace Settlement.Sportsbook.Aio.Services;

public interface IAioService
{
    Task<AioMatch> GetMatch(GetMatchRequest request);

    Task<Result> Settle(SettleRequest request);

    Task<List<ResultDetail>> GetRecalResult(GetRecalResultRequest request);

    Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

    Task<Result> VerifyNoRunningOdds(CheckRunningOddsRequest request);

    Task<Result> SaveScore(SaveScoreRequest request);

    Task<Result> SettleChildMatch(SettleChildMatchRequest request);

    Task<bool> ResultSetting(ResultSettingRequest request);
}

public class AioServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    IMapperFactory mapperFactory,
    IValidateApiKeyService validateApiKeyService,
    AioServiceDependencies dependencies)
    : IAioService
{
    private const string KeyConfirmRefund = "SettlementConfirmRefund";
    private const int defaultRedisDb = 13;

    private readonly IDatabase redisDb = dependencies.ConnectionMultiplexer.GetDatabase(defaultRedisDb);
    private readonly ICreateQueryService createQueryService = dependencies.CreateQueryService;
    private readonly MultipleServerAioService multipleServerAioService = dependencies.MultipleServerAioService;
    private readonly AdjustEventStatusService adjustEventStatusService = dependencies.AdjustEventStatusService;
    private readonly IPublishEndpoint publishEndpoint = dependencies.PublishEndpoint;

    public async Task<AioMatch> GetMatch(GetMatchRequest request)
    {
        var apiKey = validateApiKeyService.GetApiKey(request.ApiKey);
        var matchDetail = await GetMatchDetail(request, apiKey);

        var (resultDetails, ticketCounts) = await GetResultTicket(request, apiKey, matchDetail);

        var externalResults = await GetExternalResults(request, apiKey);

        var hedgeMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.HedgeMatchInfoKey}");
        var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

        var oldMatch = await GetOldMatch(matchDetail, request, apiKey);

        var childMatches = await GetChildMatch(resultDetails, request, apiKey);

        var fantasyMatch = new FantasyMatch();
        if (matchDetail.IsFantasy)
        {
            fantasyMatch = await GetRelatedMatches(matchDetail.MatchId);
        }

        return new AioMatch
        {
            MatchDetail = matchDetail,
            FantasyMatch = fantasyMatch,
            ResultDetails = resultDetails,
            TicketCounts = ticketCounts,
            Permission = request.Permission,
            HedgeMatchDetail = hedgeMatchDetail,
            ExternalResults = externalResults,
            ChildMatches = childMatches,
            OldMatchDetail = oldMatch
        };
    }

    private async Task<ResultTicket> GetResultTicket(GetMatchRequest request, string apiKey, Models.MatchDetail matchDetail)
    {
        var resultDetailCriteria = (GetResultDetailCriteria)validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
        var (resultDetails, ticketCounts) = await multipleServerAioService.FetchResultDetails(resultDetailCriteria, matchDetail.SportType);

        var mapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
        if (mapperService != null)
        {
            resultDetails.ForEach(result => result.MatchId = request.MatchId);
            await mapperService.Decorate(resultDetails);
        }
        resultDetails = resultDetails.Where(r => !r.InValid).OrderBy(result => result.OrdNo).ToList();

        var newResultDetails = await SetInterval(matchDetail, resultDetails);

        ResetScoreValue(matchDetail, newResultDetails);

        return (newResultDetails, ticketCounts);
    }

    private void ResetScoreValue(Models.MatchDetail matchDetail, List<ResultDetail> resultDetails)
    {
        if (!SportGroup.SOP.Contains(matchDetail.SportType))
        {
            return;
        }

        resultDetails.ForEach(result =>
        {
            var isInitialResult = result.ResultStatusId is null or ResultStatus.Initial or ResultStatus.Live;
            result.HomeValue = isInitialResult ? string.Empty : result.HomeValue;
            result.AwayValue = isInitialResult ? string.Empty : result.AwayValue;
        });
    }

    private async Task<Models.MatchDetail> GetMatchDetail(GetMatchRequest request, string apiKey)
    {
        var matchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.MatchInfoKey}");
        var matchDetail = await repository.GetAsync<Models.MatchDetail>(matchCriteria);

        matchDetail.RefDataService = refDataService;

        if (SportGroup.SOP.Contains(matchDetail.SportType))
        {
            var providersSetting = await GetProviderInfos(matchDetail.LeagueId, matchDetail.SportType);
            matchDetail.ProviderCount = providersSetting.Count;
        }

        return matchDetail;
    }

    private async Task<List<ProviderInfo>> GetProviderInfos(int leagueId, int sportType)
    {
        var criteria = new Settlement.Core.Criteria.GetProviderInfoCriteria { LeagueId = leagueId, SportType = sportType };
        var providers = await repository.FetchAsync<ProviderInfo>(criteria);

        return providers.ToList();
    }

    private async Task<List<ExternalResultModel>> GetExternalResults(GetMatchRequest request, string apiKey)
    {
        var externalResults = new List<ExternalResultModel>();
        var providerMapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ProviderKey}");

        if (providerMapperService != null)
        {
            var providerCriteria = validateApiKeyService.CriteriaName(request, $"{request.ApiKey}-{ApiKeyConstant.ProviderKey}");
            var providerResult = await repository.FetchAsync<ExternalResultDetailModel>(providerCriteria);
            var provider = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(providerResult.ToList(),
                []);
            await providerMapperService.Decorate(provider);
            externalResults = provider.Item2;
        }

        return externalResults;
    }

    private async Task<FantasyMatch> GetRelatedMatches(int matchId)
    {
        var criteria = new GetFantasyMatchCriteria
        {
            MatchId = matchId
        };

        var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(criteria);

        var fansFantasyRelatedMatches = secondResultSet.OrderBy(match => match.MatchCode).ToList();

        fansFantasyRelatedMatches.ForEach(match => match.RefDataService = refDataService);

        var relatedMatches = GetRelatedMatchesFromFantasyMatches(fansFantasyRelatedMatches);

        GenerateResultsRelatedMatches(relatedMatches);

        return new FantasyMatch
        {
            FantasyMatchDetail = firstResultSet.FirstOrDefault(),
            RelatedMatches = relatedMatches
        };
    }

    private List<RelatedMatch> GetRelatedMatchesFromFantasyMatches(List<FantasyRelatedMatch> relatedMatches)
    {
        var groupMatches = relatedMatches.GroupBy(match => match.MatchId);

        var newMatches = groupMatches.Select(group =>
        {
            var firstMatch = group.FirstOrDefault() ?? new FantasyRelatedMatch();

            var results = group.Select(match => new RelatedMatchResult
            {
                HomeValue = match.HomeValue,
                AwayValue = match.AwayValue,
                ResourceId = match.ResourceId,
                ResultStatusId = match.ResultStatusId,
                SettlementStatusId = match.SettlementStatusId
            }).ToList();

            ClearScore(results, ResourceType.Halftime);
            ClearScore(results, ResourceType.Final);

            return new RelatedMatch
            {
                MatchId = group.Key,
                MatchCode = firstMatch.MatchCode,
                HomeName = firstMatch.HomeName,
                AwayName = firstMatch.AwayName,
                KickOffTime = firstMatch.KickOffTime,
                Remark = firstMatch.Remark,
                EventStatus = firstMatch.EventStatus,
                BetStatus = firstMatch.BetStatus,
                HomeId = firstMatch.HomeId,
                AwayId = firstMatch.AwayId,
                IsDeleted = firstMatch.IsDeleted,
                Results = results
            };
        }).ToList();

        return newMatches;
    }

    private static void ClearScore(List<RelatedMatchResult> resultDetails, string resourceId)
    {
        var resultSettleSdt = resultDetails.Where(r => (resourceId == ResourceType.Halftime
            ? Resources.ResultHaftTime[SportType.BasketBall].Contains(r.ResourceId)
            : Resources.ResultFullTime[SportType.BasketBall].Contains(r.ResourceId)) && r.SettlementStatusId == SettlementStatus.Abandoned).ToList();

        var resultDetail = resultDetails.Find(n => n.ResourceId == resourceId);

        if (resultDetail != null && resultSettleSdt.Any())
        {
            resultDetail.HomeValue = string.Empty;
            resultDetail.AwayValue = string.Empty;
        }
    }

    private void GenerateResultsRelatedMatches(List<RelatedMatch> relatedMatches)
    {
        relatedMatches.ForEach(match =>
        {
            match.NewEventStatus = adjustEventStatusService.EventStatusAbandoned(match.EventStatus, match.Results, SportType.BasketBall);
        });
    }

    private async Task<HedgeMatchDetail> GetOldMatch(Models.MatchDetail matchDetail, GetMatchRequest request, string apiKey)
    {
        if (matchDetail is { SportType: SportType.ESports })
        {
            var getOldMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.OldMatch}");
            return await repository.GetAsync<HedgeMatchDetail>(getOldMatchCriteria);
        }

        return null;
    }

    public async Task<List<ResultDetail>> GetRecalResult(GetRecalResultRequest request)
    {
        var criteria = createQueryService.QueryRecalResult(request);
        var resultDetails = await repository.FetchAsync<ResultDetail>(criteria);

        return resultDetails.ToList();
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request)
    {
        return await dependencies.MultipleServerAioService.CheckMarkedTickets(request);
    }

    public async Task<Result> Settle(SettleRequest request)
    {
        var validateFantasyMatchResult = await ValidateFantasyMatch(request);

        if (!validateFantasyMatchResult.IsSuccessful)
        {
            return validateFantasyMatchResult;
        }

        return await dependencies.MultipleServerAioService.Settle(request);
    }

    private async Task<Result> ValidateFantasyMatch(SettleRequest request)
    {
        if (!request.IsFantasy || !request.ActionName.Equals(ActionType.CalculateAll, StringComparison.Ordinal))
        {
            return new Result();
        }

        var fantasyMatch = await GetRelatedMatches(request.MatchId);
        var relatedMatches = fantasyMatch?.RelatedMatches ?? [];
        var settlingResourceIds = request.SelectedResources.Select(x => x.ResourceId).ToList();

        var isNotCalc = relatedMatches.Exists(x => x.Results.Exists(r => settlingResourceIds.Contains(r.ResourceId)
            && r.SettlementStatusId != SettlementStatus.Completed));

        return isNotCalc ? new Result(ErrorCode.ParentFantasyNotCalc, ErrorMessage.ParentFantasyNotCalc) : new Result();
    }

    public async Task<Result> VerifyNoRunningOdds(CheckRunningOddsRequest request)
    {
        var criteria = new VerificationCriteria
        {
            MatchId = request.MatchId,
            Action = request.Action,
            CheckType = request.SelectedResources.Count > 1,
            SelectedResource = dependencies.CreateQueryService.CreateResources(request.SelectedResources)
        };

        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    public async Task<Result> SaveScore(SaveScoreRequest request)
    {
        var requestQuery = dependencies.CreateQueryService.QuerySaveScore(request);
        var criteria = validateApiKeyService.CreateNonQueryCommand(requestQuery, $"{requestQuery.ApiKey}-{ApiKeyConstant.SaveScore}") as IReturnValue;
        await repository.ExecuteAsync((INonQueryCommand)criteria);

        if (criteria == null)
        {
            return new Result();
        }

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private async Task<List<ChildMatchModel>> GetChildMatch(List<ResultDetail> resultDetails, GetMatchRequest request, string apiKey)
    {
        var childMatchMapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ChildMatchKey}");
        if (childMatchMapperService != null)
        {
            var getChildMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ChildMatchKey}");
            var childMatchList = await repository.FetchAsync<ChildMatchModel>(getChildMatchCriteria);
            var childMatchTuple = new Tuple<List<ChildMatchModel>, List<ResultDetail>>(childMatchList.ToList(), resultDetails);
            await childMatchMapperService.Decorate(childMatchTuple);
            return childMatchTuple.Item1.ToList();
        }

        return [];
    }

    public async Task<bool> ResultSetting(ResultSettingRequest request)
    {
        var criteria = dependencies.CreateQueryService.QueryChangeSetting(request);
        await repository.ExecuteAsync(criteria);

        int[] confirmRefund = [ResultSettingType.ConfirmRefund, ResultSettingType.ConfirmRefundSDT];
        if (confirmRefund.Contains(request.Type))
        {
            SetConfirmRefundKeyCache(request);
            await PushResultEvent(request);
        }

        return criteria.IsEnabled;
    }

    private async Task PushResultEvent(ResultSettingRequest request)
    {
        if (request.SportType == SportType.Soccer && request.IsEnabled)
        {
            var selectedResources = request.SelectedResources
                .Select(resource => new Fanex.Settlement.MessageBridge.RefundEvents.ResourceItem
                {
                    ResourceId = resource.ResourceId,
                    HomeValue = resource.HomeValue,
                    AwayValue = resource.AwayValue,
                    OtherInfo = resource.OtherInfo,
                    Determined = resource.Determined,
                    IsSettleDetermined = resource.IsSettleDetermined,
                    AwayId = resource.AwayId,
                    HomeId = resource.HomeId,
                    ResourceName = resource.ResourceName,
                    GroupBetType = resource.GroupBetType
                }).ToList();

            await publishEndpoint.Publish(request.Type == ResultSettingType.ConfirmRefundSDT
                ? new ResultsRefundConfirmedSdt(request.MatchId, request.SportType, request.ChildMatchType, selectedResources)
                : new ResultsRefundConfirmed(request.MatchId, request.SportType, request.ChildMatchType, selectedResources),
                new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }
    }

    private void SetConfirmRefundKeyCache(ResultSettingRequest request)
    {
        var keys = request.ResourceIds.Split(",").Select(x =>
        {
            var resourceName = GetResourceName(request.ConfirmRefundResources, x)
                ?? GetResourceName(request.SelectedResources, x)
                ?? string.Empty;

            return $"{KeyConfirmRefund}:{request.MatchId}:{x}:{resourceName}";
        });

        SetOrDeleteKeyConfirmRefund(request, keys);
    }

    private void SetOrDeleteKeyConfirmRefund(ResultSettingRequest request, IEnumerable<string> keys)
    {
        foreach (var key in keys)
        {
            if (request.IsEnabled)
            {
                redisDb.StringSet(key, request.IsEnabled, TimeSpan.FromMinutes(10));
                continue;
            }

            if (redisDb.KeyExists(key))
            {
                redisDb.KeyDelete(key);
            }
        }
    }

    private string GetResourceName(IEnumerable<Core.Models.ResourceItem> resources, string resourceId)
        => resources?.FirstOrDefault(z => z.ResourceId == resourceId)?.ResourceName;

    public async Task<Result> SettleChildMatch(SettleChildMatchRequest request)
    {
        return await dependencies.MultipleServerAioService.SettleChildMatch(request);
    }

    private async Task<List<ResultDetail>> SetInterval(Models.MatchDetail matchDetail, List<ResultDetail> resultDetails)
    {
        if (!IsIntervalSport(matchDetail.SportType))
        {
            return resultDetails;
        }

        var isMatchSeries = matchDetail.SportType == SportType.BaseBall && matchDetail.SessionTime.Equals(1);
        var setViewed = GetViewedSet(matchDetail);
        var finalResult = GetFinalResult(resultDetails);
        var extraResults = GetExtraResults(resultDetails);
        var mainResources = (await GetResourceIndex(matchDetail.SportType)).ToList();
        var mainResults = GetSetResults(resultDetails, mainResources);

        var earlyResults = resultDetails
            .Except(mainResults)
            .Except(extraResults)
            .Except([finalResult])
            .ToList();

        SetIntervalsForResults(mainResults, mainResources);

        var finalMainResults = isMatchSeries
            ? mainResults.Where(r => r.ResourceId != ResourceType.ExtraInning)
            : mainResults;

        var resultOrdered = finalMainResults
            .Where(r => r.IntervalNo <= setViewed)
            .Concat([finalResult])
            .Concat(extraResults);

        return earlyResults.Any() ? earlyResults.Concat(resultOrdered).ToList() : resultOrdered.ToList();
    }

    private int GetViewedSet(Models.MatchDetail matchDetail)
    {
        var setViewed = (matchDetail.GameSession, matchDetail.SportType, (int)matchDetail.SessionTime) switch
        {
            (3, SportType.Tennis, _) => GamePlay.Three,
            (_, SportType.Tennis, _) => GamePlay.Five,
            (0, SportType.TableTennis, _) => GamePlay.Seven,
            (6, SportType.TableTennis, _) => GamePlay.Five,
            (_, SportType.TableTennis, _) => matchDetail.GameSession,
            (0, SportType.BaseBall, 1) => GamePlay.Seven,
            (0, SportType.BaseBall, _) => GamePlay.Nine,
            (_, _, _) => matchDetail.GameSession
        };

        return setViewed;
    }

    private async Task<IEnumerable<ResourceIndex>> GetResourceIndex(int sportType)
    {
        var criteria = new GetResourceIndexCriteria { SportType = sportType };

        var indexes = await repository.FetchAsync<ResourceIndex>(criteria);

        return indexes.Where(r => r.ResourceId != ResourceType.Final).ToList();
    }

    private bool IsIntervalSport(int sportType)
    {
        int[] intervalSports = [SportType.Tennis, SportType.TableTennis, SportType.BaseBall];
        return intervalSports.Contains(sportType);
    }

    private ResultDetail GetFinalResult(List<ResultDetail> resultDetails)
    {
        return resultDetails.First(r => r.ResourceId == ResourceType.Final);
    }

    private List<ResultDetail> GetSetResults(List<ResultDetail> resultDetails, List<ResourceIndex> mainResources)
    {
        var resourceIds = mainResources.Select(x => x.ResourceId).ToList();

        return resultDetails.Where(Predicate).ToList();

        bool Predicate(ResultDetail result) => result.ResourceId != ResourceType.Final && resourceIds.Contains(result.ResourceId);
    }

    private List<ResultDetail> GetExtraResults(List<ResultDetail> resultDetails)
    {
        return resultDetails
             .Where(x => Resources.ExtraResults[SportType.BaseBall].Contains(x.ResourceId))
             .ToList();
    }

    private void SetIntervalsForResults(List<ResultDetail> setResults, List<ResourceIndex> indexes)
    {
        foreach (var result in setResults)
        {
            result.IntervalNo = indexes.Find(i => i.ResourceId == result.ResourceId).IntervalNo;
        }
    }
}

public class AioServiceDependencies
{
    public ICreateQueryService CreateQueryService { get; }
    public MultipleServerAioService MultipleServerAioService { get; }
    public AdjustEventStatusService AdjustEventStatusService { get; }
    public IConnectionMultiplexer ConnectionMultiplexer { get; }
    public IPublishEndpoint PublishEndpoint { get; }

    public AioServiceDependencies(
        ICreateQueryService createQueryService,
        MultipleServerAioService multipleServerAioService,
        AdjustEventStatusService adjustEventStatusService,
        IConnectionMultiplexer connectionMultiplexer,
        IPublishEndpoint publishEndpoint)
    {
        CreateQueryService = createQueryService;
        MultipleServerAioService = multipleServerAioService;
        AdjustEventStatusService = adjustEventStatusService;
        ConnectionMultiplexer = connectionMultiplexer;
        PublishEndpoint = publishEndpoint;
    }
}