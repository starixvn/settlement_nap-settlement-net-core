using AutoFixture;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Models;
using Settlement.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class MatchServiceTests
{
    private readonly MatchService service;

    private readonly IDynamicRepository repository;

    private readonly BetBuilderMatchesService betBuilderMatchesService;

    private readonly BetBuilderService betBuilderService;

    public MatchServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var refDataService = Substitute.For<IRefDataService>();
        Substitute.For<BetBuilderCalculateService>();
        betBuilderMatchesService = Substitute.For<BetBuilderMatchesService>();
        betBuilderService = Substitute.For<BetBuilderService>();
        repository.Fetch<MatchDetailModel>(Arg.Any<CriteriaBase>()).Returns(new List<MatchDetailModel>());
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new MatchServiceImp(refDataService, mapper, repository, betBuilderMatchesService, betBuilderService);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnsIsExistedMatch()
    {
        // Arrange
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
}