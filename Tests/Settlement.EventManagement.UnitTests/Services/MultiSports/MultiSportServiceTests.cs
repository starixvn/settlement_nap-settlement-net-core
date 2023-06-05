using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class MultiSportServiceTests
{
    private readonly IMultiSportService service;

    private readonly IDynamicRepository repository;

    private readonly IMatchService matchService;

    private readonly ICacheService cacheService;

    private readonly IRefDataService refDataService;

    public MultiSportServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var permissionService = Substitute.For<PermissionService>(null, null, null, null);
        matchService = Substitute.For<IMatchService>();
        cacheService = Substitute.For<ICacheService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSetting = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02" } };
        var option = Options.Create(appSetting);
        refDataService = Substitute.For<IRefDataService>();
        var redisCache = Substitute.For<RedisCacheService>();
        service = new MultiSportServiceImp(repository, matchService, mapper, cacheService, permissionService, option, redisCache);
    }

    [Fact]
    public async Task GetWaitingMatches_ExistMatchesOnCache_ReturnNotNullWhenHaveMatchInCache()
    {
        // Arrange
        var request = new RefreshMultiSportRequest { LeagueIds = "1,2" };
        var data = new List<MultiSportMatchWaiting>
            {
                new()
            };
        cacheService.GetAsync<List<MultiSportMatchWaiting>>(Arg.Any<string>()).Returns(data);

        // Act
        var matches = await service.GetWaitingMatches(request);

        // Assert
        Assert.NotNull(matches);
    }

    [Fact]
    public async Task GetWaitingMatches_NotExistMatchesOnCache_ReturnQueriedMatches()
    {
        var match = new Match
        {
            MatchId = 700000,
            SportType = 2,
            LeagueId = 1
        };
        var resultDetail = new ResultDetail
        {
            MatchId = 700000,
            ResourceId = "01"
        };
        var request = new RefreshMultiSportRequest
        {
            LeagueIds = "1,2"
        };
        var listMatch = new List<Match> { match };
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail> { resultDetail });
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(new List<Match> { match });
        matchService.SetNewMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);
        var waitingMatches = await service.GetWaitingMatches(request);

        Assert.NotNull(waitingMatches);
    }

    [Fact]
    public async Task GetSportBook_Always_ReturnQueriedMatches()
    {
        var match = new Match
        {
            MatchId = 700000,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService
        };
        var listMatch = new List<Match> { match };
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail>());
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(new List<Match> { match });
        matchService.SetNewMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);
        matchService.SortingMatches(Arg.Any<List<Match>>()).Returns(new List<Match> { match });
        var sportBooks = await service.GetSportBook(new FilterMultiSportRequest());

        var actualMatches = sportBooks[0].Leagues[0].Matches;

        Assert.NotNull(actualMatches);
    }
}