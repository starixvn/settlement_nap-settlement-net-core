using AutoFixture;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class MatchServiceTests
{
    private readonly MatchService service;

    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly BetBuilderCalculateService betBuilderCalculateService;

    private readonly BetBuilderMatchesService betBuilderMatchesService;

    private readonly BetBuilderService betBuilderService;

    public MatchServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        betBuilderCalculateService = Substitute.For<BetBuilderCalculateService>();
        betBuilderMatchesService = Substitute.For<BetBuilderMatchesService>();
        betBuilderService = Substitute.For<BetBuilderService>();
        repository.Fetch<MatchDetailModel>(Arg.Any<CriteriaBase>()).Returns(new List<MatchDetailModel>());
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSetting = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var option = Options.Create(appSetting);
        service = new MatchServiceImp(refDataService, mapper, repository, betBuilderCalculateService, betBuilderMatchesService, betBuilderService, option);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnsIsExistedMatch()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            MatchId = 1,
            ResourceId = "01"
        };
        var fakeMatches = new MatchDetailModel
        {
            MatchId = 1
        };

        repository.GetAsync<MatchDetailModel>(Arg.Any<ICriteria>()).Returns(fakeMatches);

        // Act
        var actualMatch = await service.GetMatch(new MatchInfoRequest());

        Assert.NotNull(actualMatch);
        await betBuilderMatchesService.Received().ResultDetailByMatchIds(Arg.Any<List<MatchDetailModel>>());
        betBuilderService.Received()
            .GetScoreByMatchId(Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>(), true);
    }

    [Fact]
    public async Task GetSelection_Always_ReturnsNotNull()
    {
        // Arrange
        var fixture = new Fixture();
        var fakeSelection = fixture.CreateMany<SelectionDetailModel>(4).ToList();
        repository.FetchAsync<SelectionDetailModel>(Arg.Any<SelectionDetailCriteria>()).Returns(fakeSelection);

        // Act
        var selection = await service.GetSelection(1);

        // Assert
        Assert.True(selection.Count == 4);
    }

    [Fact]
    public async Task Calculate_Always_CallRelatedMethods()
    {
        // Arrange
        betBuilderCalculateService.CreateCriteria(100, "test", Arg.Any<string>()).Returns(new CalculationCriteria());

        // Act
        var result = await service.Calculate(new CalculateRequest { MatchId = 100, ActionName = "test" });

        // Assert
        Assert.Null(result.ErrMsg);
        betBuilderCalculateService.Received().CreateResources(Arg.Any<List<ResourcesItemModel>>());
        betBuilderCalculateService.Received().CreateCriteria(100, "test", Arg.Any<string>());
        await betBuilderCalculateService.Received().GetInfoMarket(Arg.Any<CalculationCriteria>());
        await betBuilderCalculateService.Received().UpdateMatchInfo(Arg.Any<CalculationCriteria>(), Arg.Any<string>());
        await repository.Received(2).ExecuteAsync(Arg.Any<CalculationCriteria>());
    }
}