using AutoFixture;
using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class BetBuilderServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly MergeMatchInfo mergeMatchInfo;

    private readonly XmlConvertService xmlConvertService;

    private readonly BetBuilderService service;

    public BetBuilderServiceTests()
    {
        var refDataService = Substitute.For<IRefDataService>();
        repository = Substitute.For<IDynamicRepository>();
        var scoreService = Substitute.For<ScoreService>();
        mergeMatchInfo = Substitute.For<MergeMatchInfo>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSetting = new AppSettingsKey
        {
            SiteDbServer = new List<string> { "01", "02" }
        };
        var option = Options.Create(appSetting);
        service = new BetBuilderServiceImp(repository, refDataService, mapper, scoreService, xmlConvertService, mergeMatchInfo, option);
    }

    [Fact]
    public async Task GetSports_Always_ReturnsNotNull()
    {
        // Arrange
        var fixture = new Fixture();
        var fakeSports = fixture.CreateMany<Sport>(2).ToList();
        repository.FetchAsync<Sport>(Arg.Any<SportCriteria>()).Returns(fakeSports);

        // Act
        var sports = await service.GetSports(new SportRequest());

        // Assert
        Assert.True(sports.Count == 2);
    }

    [Fact]
    public async Task GetLeagues_Always_ReturnsNotNull()
    {
        // Arrange
        var fixture = new Fixture();
        var fakeLeagues = fixture.CreateMany<LeagueTypeModel>(3).ToList();
        repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeaguesCriteria>()).Returns(fakeLeagues);

        // Act
        var leagues = await service.GetLeagues(new LeaguesRequest());

        // Assert
        Assert.True(leagues.Count == 3);
    }

    [Fact]
    public void CreateLeagues_Always_GroupMatchByLeague()
    {
        var matches = new List<MatchDetailModel>
            {
                new()
                {
                    SportType = 3,
                    LeagueId = 1
                },
                new()
                {
                SportType = 2,
                LeagueId = 2
                },
                new()
                {
                    SportType = 3,
                    LeagueId = 4
                }
            };

        var result = service.CreateLeagues(matches);

        Assert.Equal(2, result[0].LeagueId);
        Assert.Equal(1, result[1].LeagueId);
        Assert.Equal(4, result[2].LeagueId);
    }

    [Fact]
    public async Task GetResourcesMarket_Always_ReturnResources()
    {
        var resources = new List<ResourceSelectionItemModel>
            {
                new()
                {
                    MarketId = 220
                }
            };
        repository.FetchAsync<ResourceSelectionItemModel>(Arg.Any<SelectionTicketDetailCriteria>()).Returns(resources);
        mergeMatchInfo.MergeStatusTicket(Arg.Any<List<ResourceSelectionItemModel>>(), Arg.Any<List<ResourceSelectionItemModel>>());
        xmlConvertService.Serialize(Arg.Any<Models.Resources<ResourceSelectionItemModel>>()).Returns(resources[0].MarketId.ToString());

        var result = await service.GetResourcesMarket(1);

        Assert.Equal("220", result);
    }
}