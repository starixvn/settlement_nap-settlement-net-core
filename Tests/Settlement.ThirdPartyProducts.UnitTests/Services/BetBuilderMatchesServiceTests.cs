using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class BetBuilderMatchesServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly MergeMatchInfo mergeMatchInfo;

    private readonly BetBuilderService betBuilderService;

    private readonly BetBuilderMatchesService service;

    public BetBuilderMatchesServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        mergeMatchInfo = Substitute.For<MergeMatchInfo>();
        var cachingMatchesService = Substitute.For<CachingMatchesService>();
        betBuilderService = Substitute.For<BetBuilderService>();
        var appSettingsKey = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var options = Options.Create(appSettingsKey);
        service = new BetBuilderMatchesServiceImp(repository, refDataService, mapper, mergeMatchInfo,
            cachingMatchesService, betBuilderService, options);
    }

    private MatchDetailModel CreateMatch(int matchId)
    {
        return new MatchDetailModel
        {
            MatchId = matchId,
            SportType = 1,
            RefDataService = refDataService
        };
    }

    [Fact]
    public async Task Search_Always_GetInfoAfterExecute()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            MatchId = 1,
            ResourceId = "01"
        };
        var fakeMatches = new List<MatchDetailModel> {
                CreateMatch(2),
                CreateMatch(1),
                CreateMatch(3)
        };

        repository.FetchAsync<MatchDetailModel>(Arg.Any<ICriteria>()).Returns(fakeMatches);
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail> { resultDetail });
        betBuilderService.GetScoreByMatchId(Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>(), false).Returns(new MoreScores());
        mergeMatchInfo.ParlayStatus(Arg.Any<MatchDetailModel>()).Returns("Completed", "Refunded", "Running");
        refDataService.GetLeagueName(Arg.Any<int>()).Returns("1", "2", "1");
        refDataService.GetSportName(Arg.Any<int>()).Returns("soccer");
        betBuilderService.CreateLeagues(Arg.Any<List<MatchDetailModel>>()).Returns(new List<LeagueModel>());

        // Act
        await service.Search(new FilterRequest { Status = "Completed, Running" });

        betBuilderService.Received().CreateLeagues(Arg.Is<List<MatchDetailModel>>(item => item.Count == 2));
        mergeMatchInfo.Received(2).AddSiteMatch(Arg.Any<List<MatchDetailModel>>(), Arg.Any<List<Models.SiteMatch>>());
        await repository.Received(2).FetchAsync<Models.SiteMatch>(Arg.Any<TicketsInfoCriteria>());
    }

    [Fact]
    public async Task ResultDetailByMatchIds_Always_ReturnFromSP()
    {
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail> { new() { ResourceId = "00" } });

        var result = await service.ResultDetailByMatchIds(new List<MatchDetailModel>());

        Assert.Equal("00", result[0].ResourceId);
        Assert.Single(result);
    }
}