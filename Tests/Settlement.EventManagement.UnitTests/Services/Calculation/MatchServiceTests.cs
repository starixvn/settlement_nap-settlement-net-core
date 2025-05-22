using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.Calculation;
using Match = Settlement.EventManagement.Models.Calculation.Match;
using ReferenceAction = Settlement.EventManagement.Models.Calculation.ReferenceAction;

namespace Settlement.EventManagement.UnitTests.Services.Calculation;

using Requests;

public class MatchServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly CachingMatchesService cachingMatchesService;

    private readonly IRefDataService refDataService;

    private readonly NewInfoMatchService newInfoMatchService;

    private readonly MatchService service;

    public MatchServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        cachingMatchesService = Substitute.For<CachingMatchesService>();
        refDataService = Substitute.For<IRefDataService>();
        var mergeDataService = Substitute.For<MergeDataService>();
        newInfoMatchService = Substitute.For<NewInfoMatchService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettingsKey = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var options = Options.Create(appSettingsKey);
        service = new MatchServiceImp(repository, refDataService, cachingMatchesService, mergeDataService, newInfoMatchService, options, mapper);
    }

    [Fact]
    public async Task GetSportBook_Always_ReturnQueriedMatches()
    {
        var match = new Match
        {
            MatchId = 1,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService,
            EventStatus = EventStatus.Completed,
            MatchCode = "123456"
        };
        var matchCompletedWithRunning = new Match
        {
            MatchId = 2,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService,
            EventStatus = EventStatus.Completed,
            IsExistRunningTicket = true,
            MatchCode = "12345"
        };

        var matchRunning = new Match
        {
            MatchId = 3,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService,
            EventStatus = EventStatus.Running,
            IsExistRunningTicket = true,
            MatchCode = "1234"
        };
        var listMatch = new List<Match> { match, matchCompletedWithRunning, matchRunning };
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail>());
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        //newInfoMatchService.GetAutoPayoutStatus((Arg.Any<List<int>>()).Returns((listMatch);
        var sportBooks = await service.GetMatches(new FilterCalculationRequest());

        Assert.NotNull(sportBooks);
        Assert.Equal("2,3,1", string.Join(',', sportBooks.Select(item => item.MatchId.ToString()).ToList()));
        newInfoMatchService.Received().TicketInfo(Arg.Any<Match>());
        newInfoMatchService.Received().NewEventStatus(Arg.Any<Match>());
        newInfoMatchService.Received().EventStatusColor(Arg.Any<Match>());
        newInfoMatchService.Received().EarlySettlementStatus(Arg.Any<Match>());
        newInfoMatchService.Received().FastMarketStatus(Arg.Any<Match>());
        newInfoMatchService.Received().ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Halftime);
        newInfoMatchService.Received().ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Final);
        newInfoMatchService.Received().GoalIcon(Arg.Any<Match>());
        newInfoMatchService.Received(6).IsInconsistentScore(Arg.Any<string>(), Arg.Any<List<ResultDetail>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<string>());
        newInfoMatchService.Received().GoalIcon(Arg.Any<Match>());
    }

    [Fact]
    public async Task GetMatchesAutoCalculate_Always_ReturnQueriedMatches()
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
        cachingMatchesService.GetReferenceActions(Arg.Any<IEnumerable<int>>())
            .Returns(new Dictionary<int, List<ReferenceAction>>());

        var sportBooks = await service.GetMatchesAutoCalculate(new FilterAutoCalculationRequest());

        Assert.NotNull(sportBooks);
        newInfoMatchService.Received().TicketInfo(Arg.Any<Match>());
        newInfoMatchService.Received().NewEventStatus(Arg.Any<Match>());
        newInfoMatchService.Received().EventStatusColor(Arg.Any<Match>());
        newInfoMatchService.Received().EarlySettlementStatus(Arg.Any<Match>());
        newInfoMatchService.Received().FastMarketStatus(Arg.Any<Match>());
        newInfoMatchService.Received().ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Halftime);
        newInfoMatchService.Received().ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Final);
        newInfoMatchService.Received().GoalIcon(Arg.Any<Match>());
        newInfoMatchService.Received(2).IsInconsistentScore(Arg.Any<string>(), Arg.Any<List<ResultDetail>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<string>());
        newInfoMatchService.Received().GoalIcon(Arg.Any<Match>());
    }
}