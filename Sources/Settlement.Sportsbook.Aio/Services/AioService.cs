using Fanex.NAP.Client;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Basketball;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

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

public class AioServiceImp : IAioService
{
    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly ICreateQueryService createQueryService;

    private readonly IMapperFactory mapperFactory;

    private readonly IValidateApiKeyService validateApiKeyService;

    private readonly MultipleServerAioService multipleServerAioService;

    private readonly BasketballEventStatusService basketballEventStatusService;

    public AioServiceImp(
        IDynamicRepository repository,
        IRefDataService refDataService,
        IMapperFactory mapperFactory,
        IValidateApiKeyService validateApiKeyService,
        ICreateQueryService createQueryService,
        MultipleServerAioService multipleServerAioService,
        BasketballEventStatusService basketballEventStatusService)
    {
        this.repository = repository;
        this.refDataService = refDataService;
        this.mapperFactory = mapperFactory;
        this.validateApiKeyService = validateApiKeyService;
        this.createQueryService = createQueryService;
        this.multipleServerAioService = multipleServerAioService;
        this.basketballEventStatusService = basketballEventStatusService;
    }

    public async Task<AioMatch> GetMatch(GetMatchRequest request)
    {
        var apiKey = validateApiKeyService.GetApiKey(request.ApiKey);
        var matchDetail = await GetMatchDetail(request, apiKey);

        var externalResults = new List<ExternalResultModel>();
        var providerMapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ProviderKey}");
        if (providerMapperService != null)
        {
            var providerCriteria = validateApiKeyService.CriteriaName(request, $"{request.ApiKey}-{ApiKeyConstant.ProviderKey}");
            var providerResult = await repository.FetchAsync<ExternalResultDetailModel>(providerCriteria);
            var provider = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(providerResult.ToList(), new List<ExternalResultModel>());
            providerMapperService.Decorate(provider);
            externalResults = provider.Item2;
        }

        var resultDetailCriteria = (GetResultDetailCriteria)validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
        var (resultDetails, ticketCounts) = await multipleServerAioService.FetchResultDetails(resultDetailCriteria, matchDetail.SportType);

        var mapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
        if (mapperService != null)
        {
            resultDetails.ForEach(result => result.MatchId = request.MatchId);
            mapperService.Decorate(resultDetails);
        }

        var hedgeMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.HedgeMatchInfoKey}");
        var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);
        var oldMatch = await GetOldMatch(matchDetail, request, apiKey);

        var childMatches = await GetChildMatch(resultDetails, request, apiKey);
        resultDetails = resultDetails.OrderBy(result => result.OrdNo).ToList();

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

    private async Task<Models.MatchDetail> GetMatchDetail(GetMatchRequest request, string apiKey)
    {
        var matchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.MatchInfoKey}");
        var matchDetail = await repository.GetAsync<Models.MatchDetail>(matchCriteria);

        ArgumentNullException.ThrowIfNull(matchDetail, $"Match ${request.MatchId} does not exist");

        matchDetail.RefDataService = refDataService;

        return matchDetail;
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
            RelatedMatches = relatedMatches,
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
                SettlementStatusId = match.SettlementStatusId,
            }).ToList();

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

    private void GenerateResultsRelatedMatches(List<RelatedMatch> relatedMatches)
    {
        relatedMatches.ForEach(match =>
        {
            match.NewEventStatus = basketballEventStatusService.AdjustEventStatusAbandoned(match.EventStatus, match.Results, SportType.BasketBall);
        });
    }

    private async Task<HedgeMatchDetail> GetOldMatch(Models.MatchDetail matchDetail, GetMatchRequest request, string apiKey)
    {
        if (matchDetail is { SportType: Core.Constants.SportType.ESports })
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
        return await multipleServerAioService.CheckMarkedTickets(request);
    }

    public async Task<Result> Settle(SettleRequest request)
    {
        return await multipleServerAioService.Settle(request);
    }

    public async Task<Result> VerifyNoRunningOdds(CheckRunningOddsRequest request)
    {
        var criteria = new VerificationCriteria
        {
            MatchId = request.MatchId,
            Action = request.Action,
            CheckType = request.SelectedResources.Count > 1,
            SelectedResource = createQueryService.CreateResources(request.SelectedResources)
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
        var requestQuery = createQueryService.QuerySaveScore(request);
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

    private async Task<List<ChildMatchModel>> GetChildMatch(List<ResultDetail> resultDetail, GetMatchRequest request, string apiKey)
    {
        var childMatchMapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ChildMatchKey}");
        if (childMatchMapperService != null)
        {
            var getChildMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ChildMatchKey}");
            var childMatchList = await repository.FetchAsync<ChildMatchModel>(getChildMatchCriteria);
            var childMatchTuple = new Tuple<List<ChildMatchModel>, List<ResultDetail>>(childMatchList.ToList(), resultDetail);
            childMatchMapperService.Decorate(childMatchTuple);
            return childMatchTuple.Item1.ToList();
        }

        return new List<ChildMatchModel>();
    }

    public async Task<bool> ResultSetting(ResultSettingRequest request)
    {
        var criteria = createQueryService.QueryChangeSetting(request);

        await repository.ExecuteAsync(criteria);
        return criteria.IsEnabled;
    }

    public async Task<Result> SettleChildMatch(SettleChildMatchRequest request)
    {
        return await multipleServerAioService.SettleChildMatch(request);
    }
}