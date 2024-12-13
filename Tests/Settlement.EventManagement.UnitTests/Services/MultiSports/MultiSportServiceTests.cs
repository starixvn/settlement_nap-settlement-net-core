using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class MultiSportServiceTests
{
    private readonly IMultiSportService service;

    private readonly IDynamicRepository repository;

    private readonly IMatchService matchService;

    private readonly IRefDataService refDataService;

    public MultiSportServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        matchService = Substitute.For<IMatchService>();

        var siteMatchService = Substitute.For<SiteMatchService>();
        var cacheService = Substitute.For<IMemoryCache>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSetting = new AppSettingsKey { SiteDbServer = ["DB01", "DB02"] };
        var option = Options.Create(appSetting);
        refDataService = Substitute.For<IRefDataService>();
        service = new MultiSportServiceImp(repository, matchService, mapper, cacheService, siteMatchService, option);
    }

    [Fact]
    public async Task GetWaitingMatches_NotExistMatchesOnCache_ReturnQueriedMatches()
    {
        // Arrange
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
        repository.FetchMultipleAsync<Match, MatchOverStatus, ParentChildMatchFilter>(Arg.Any<SportsbookCriteria>()).Returns((listMatch, [], []));
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail> { resultDetail });
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(
            [match]);
        matchService.SetNewMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);

        // Act
        var waitingMatches = await service.GetWaitingMatches(request, false);

        // Assert
        Assert.NotNull(waitingMatches);
    }

    [Fact]
    public async Task GetSportBook_Always_ReturnQueriedMatches()
    {
        // Arrange
        var match = new Match
        {
            MatchId = 700000,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService
        };
        var listMatch = new List<Match> { match };
        repository.FetchMultipleAsync<Match, MatchOverStatus, ParentChildMatchFilter>(Arg.Any<SportsbookCriteria>()).Returns((listMatch, [], []));
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail>());
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(
            [match]);
        matchService.SetNewOsMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);
        matchService.SortingMatches(Arg.Any<List<Match>>()).Returns([match]);

        // Act
        var sportBooks = await service.GetSportBook(new FilterMultiSportRequest(), false);

        var actualMatches = sportBooks[0].Leagues[0].Matches;

        // Assert
        Assert.NotNull(actualMatches);
    }
}