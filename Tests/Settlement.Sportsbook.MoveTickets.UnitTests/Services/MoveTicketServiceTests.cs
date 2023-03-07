using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MoveTicketServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly IRefDataService refDataService;
    private readonly IMapper mapper;
    private readonly IMatchService matchService;
    private readonly IHttpContextAccessor accessor;
    private readonly IMoveTicketService service;

    public MoveTicketServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        accessor = Substitute.For<IHttpContextAccessor>();
        matchService = Substitute.For<IMatchService>();
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
        accessor.HttpContext = context;
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        mapper = new Mapper(config);
        var appSetting = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var option = Options.Create(appSetting);
        service = new MoveTicketServiceImp(repository, refDataService, mapper, matchService, option);
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
            ReferenceActions = new List<ReferenceAction>(),
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
        var referenceAction = new ReferenceAction
        {
            LogDate = new DateTime(2000, 1, 3, 7, 0, 0),
            MatchId = 1
        };
        var fakeReferenceAction = new List<ReferenceAction> { referenceAction };
        var fakeMatches = new List<Match> {
            CreateMatch(2, "Completed", false),
            CreateMatch(1, "Completed", true),
            CreateMatch(3, "Result Pending", false),
            CreateMatch(4, "Closed", false),
            CreateMatch(5, "Refund FT", false),
            CreateMatch(6, "Refund HT", false),
            CreateMatch(7, "Refund", false),
            CreateMatch(8, "Running", false),
            CreateMatch(9, "Postponed", false),
            CreateMatch(10, "Internal", false),
        };

        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(fakeMatches);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail> { resultDetail });
        repository.Fetch<ReferenceAction>(Arg.Any<ICriteria>()).Returns(fakeReferenceAction);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>()).Returns(fakeMatches);

        // Act
        var sportBooks = await service.GetSportBook(new GetMatchRequest());
        var actualMatches = sportBooks[0].Leagues[0].Matches;

        // Assert
        var expectedMatches = new List<Match> {
            CreateMatch(1, "Completed", true),
            CreateMatch(8, "Running", false),
            CreateMatch(3, "Result Pending", false),
            CreateMatch(9, "Postponed", false),
            CreateMatch(10, "Internal", false),
            CreateMatch(4, "Closed", false),
            CreateMatch(2, "Completed", false),
            CreateMatch(6, "Refund HT", false),
            CreateMatch(5, "Refund FT", false),
            CreateMatch(7, "Refund", false),
        };

        expectedMatches[0].ReferenceActions.Add(referenceAction);

        Assert.Equal(JsonConvert.SerializeObject(expectedMatches), JsonConvert.SerializeObject(actualMatches));
        await repository.Received(2).FetchAsync<Match>(Arg.Any<SportsbookCriteria>());
    }

    //[Fact]
    //public async Task MoveTicket_Always_ReturnResult()
    //{
    //    await repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(x =>
    //    {
    //        x.ErrCode = 0;
    //        x.ErrMsg = "";
    //    }));

    //    var actual = await service.MoveTicket(new MoveTicketRequest());

    //    Assert.True(actual.IsSuccessful);
    //}

    //[Fact]
    //public async Task MoveTicket_IsFail_AlwaysCallActionLog()
    //{
    //    await repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(x =>
    //    {
    //        x.ErrCode = 1;
    //        x.ErrMsg = "message";
    //    }));

    //    await service.MoveTicket(new MoveTicketRequest());

    //    logService.Received().ActionLog(Arg.Any<int>(), Arg.Any<string>(), Arg.Any<int>());
    //}

    [Fact]
    public async Task GetChildMatch_Always_ReturnCorrectMatch()
    {
        var listMatch = new List<ChildMatch>
        {
            new ChildMatch {matchId = 1}
        };

        repository.FetchAsync<ChildMatch>(Arg.Any<ICriteria>()).Returns(listMatch);

        var actual = await service.GetChildMatch(new GetChildMatchRequest());

        Assert.Equal(listMatch, actual);
    }

    [Fact]
    public async Task GetMoveTicketsMatches_Always_ReturnCorrectMatch()
    {
        var listMatch = new List<MoveTicketsMatchDetail>
        {
            new MoveTicketsMatchDetail {MatchId = 1}
        };

        repository.FetchAsync<MoveTicketsMatchDetail>(Arg.Any<ICriteria>()).Returns(listMatch);

        var actual = await service.GetMoveTicketsMatches(new GetMoveTicketsMatchesRequest());

        Assert.Equal(listMatch, actual);
    }
}