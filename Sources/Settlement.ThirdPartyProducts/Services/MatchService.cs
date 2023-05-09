using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface MatchService
{
    Task<Result> Calculate(CalculateRequest request);

    Task<MatchDetailModel> GetMatch(MatchInfoRequest request);

    Task<List<SelectionDetailModel>> GetSelection(int matchId);
}

public class MatchServiceImp : MatchService
{
    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly IMapper mapper;

    private readonly BetBuilderCalculateService betBuilderCalculateService;

    private readonly BetBuilderMatchesService betBuilderMatchesService;

    private readonly BetBuilderService betBuilderService;

    private readonly AppSettingsKey appSettingsKey;

    public MatchServiceImp(
        IRefDataService refDataService,
        IMapper mapper,
        IDynamicRepository repository,
        BetBuilderCalculateService betBuilderCalculateService,
        BetBuilderMatchesService betBuilderMatchesService,
        BetBuilderService betBuilderService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.refDataService = refDataService;
        this.mapper = mapper;
        this.repository = repository;
        this.betBuilderCalculateService = betBuilderCalculateService;
        this.betBuilderMatchesService = betBuilderMatchesService;
        this.betBuilderService = betBuilderService;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<Result> Calculate(CalculateRequest request)
    {
        var resourcesResult = betBuilderCalculateService.CreateResources(request.Resources);

        var criteria = betBuilderCalculateService.CreateCriteria(request.MatchId, request.ActionName, resourcesResult);
        var selectedMarket = await betBuilderCalculateService.GetInfoMarket(criteria);
        await betBuilderCalculateService.UpdateMatchInfo(criteria, selectedMarket);
        criteria.SelectedMarket = selectedMarket;
        //TODO
        await ExecuteMultiServer(criteria);
        return new Result();
    }

    public async Task<MatchDetailModel> GetMatch(MatchInfoRequest request)
    {
        var criteria = mapper.Map<MatchInfoRequest, MatchInfoCriteria>(request);
        var matchDetail = await repository.GetAsync<MatchDetailModel>(criteria);
        var resultDetails = await betBuilderMatchesService.ResultDetailByMatchIds(new List<MatchDetailModel> { matchDetail });
        matchDetail.MoreScores = betBuilderService.GetScoreByMatchId(resultDetails, matchDetail.MatchId, matchDetail.SportType, true);
        matchDetail.RefDataService = refDataService;
        return matchDetail;
    }

    public async Task<List<SelectionDetailModel>> GetSelection(int matchId)
    {
        var criteria = new SelectionDetailCriteria
        {
            MatchId = matchId,
            Resources = await betBuilderService.GetResourcesMarket(matchId)
        };

        return (await repository.FetchAsync<SelectionDetailModel>(criteria)).ToList();
    }

    private async Task ExecuteMultiServer(CalculationCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }
}