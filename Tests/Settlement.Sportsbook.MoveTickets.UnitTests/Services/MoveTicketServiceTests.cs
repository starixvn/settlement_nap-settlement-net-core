using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services.MultipleServer;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MoveTicketServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly IRefDataService refDataService;
    private readonly IMatchService matchService;
    private readonly MoveTicketService service;
    private readonly SiteMatchService siteMatchService;

    public MoveTicketServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        matchService = Substitute.For<IMatchService>();
        siteMatchService = Substitute.For<SiteMatchService>();

        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSetting = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var option = Options.Create(appSetting);
        service = new MoveTicketServiceImp(repository, refDataService, mapper, matchService, option, siteMatchService);
    }

    private Match CreateMatch(int matchId, string eventStatus, bool isMarkedTicket)
    {
        return new Match
        {
            MatchId = matchId,
            SportType = 50,
            NewEventStatus = eventStatus,
            IsExistMarkedTicket = isMarkedTicket,
            RefDataService = refDataService,
            ReferenceActions = []
        };
    }

    [Fact]
    public async Task GetSportBook_Always_ReturnsExpectedOrderMatch()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            MatchId = 1,
            ResourceId = "01"
        };

        var fakeMatches = new List<Match> {
            CreateMatch(1, "Completed", true),
        };

        repository.FetchMultipleAsync<Match, MatchOverStatus, ParentChildMatchFilter>(Arg.Any<SportsbookCriteria>()).Returns((fakeMatches, [], []));

        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail> { resultDetail });
        repository.Fetch<ReferenceAction>(Arg.Any<ICriteria>()).Returns([]);
        repository.FetchAsync<SiteMatch>(Arg.Any<OSTicketInfoSelCriteria>()).Returns(new List<SiteMatch>
        {
           new ()
           {
                MatchId = 1,
                IsExistMarkedTicket = true
           }
        });
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>()).Returns(fakeMatches);

        // Act
        var sportBooks = await service.GetSportBook(new GetMatchRequest());
        var actualMatches = sportBooks[0].Leagues[0].Matches;

        // Assert
        var expectedMatches = new List<Match> {
            CreateMatch(1, "Completed", true),
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedMatches), JsonConvert.SerializeObject(actualMatches));
    }

    [Fact]
    public async Task GetMoveTicketsMatches_Always_ReturnCorrectMatch()
    {
        var listMatch = new List<MoveTicketsMatchDetail>
        {
            new() {MatchId = 1}
        };

        repository.FetchAsync<MoveTicketsMatchDetail>(Arg.Any<ICriteria>()).Returns(listMatch);

        var actual = await service.GetMoveTicketsMatches(new GetMoveTicketsMatchesRequest());

        Assert.Equal(listMatch, actual);
    }
}