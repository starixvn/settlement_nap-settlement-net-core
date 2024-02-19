
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Handlers;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Handlers;

using Soccer.Services.GetMatch;

public class SoccerHandlerTests
{
    private readonly CalculateHandler handler;

    private readonly IMatchService matchService;
    private readonly ICalculateService calculateService;

    public SoccerHandlerTests()
    {
        var currentSession = Substitute.For<INapSession>();
        currentSession.UserId = 8;
        matchService = Substitute.For<IMatchService>();
        calculateService = Substitute.For<ICalculateService>();
        var instantCalculateService = Substitute.For<InstantCalculateService>();
        handler = new CalculateHandler(currentSession, matchService, calculateService, instantCalculateService);
    }

    [Fact]
    public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
    {
        var result = new Match();
        matchService.GetMatch(Arg.Any<GetMatchRequest>()).Returns(result);

        var actual = await handler.Handle(new GetMatchRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        calculateService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest { ActionName = ActionType.CalculateAll }, new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResultWithUncal()
    {
        var result = new Result();
        calculateService.UnCalculate(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest { ActionName = ActionType.UnCalculate }, new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetLatestMatchDetailRequest_Always_ReturnCorrectMatchDetail()
    {
        var result = new MatchDetail();
        matchService.GetLatestMatchDetail(Arg.Any<GetLatestMatchDetailRequest>()).Returns(result);

        var actual = await handler.Handle(new GetLatestMatchDetailRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckStatusRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        calculateService.CheckStatus(Arg.Any<CheckStatusRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckStatusRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }
}