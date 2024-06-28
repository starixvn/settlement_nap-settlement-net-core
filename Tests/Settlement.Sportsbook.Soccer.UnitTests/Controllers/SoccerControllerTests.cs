using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Models;
using Settlement.Sportsbook.Soccer.Controllers;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Match = Settlement.Sportsbook.Soccer.Models.Match;

namespace Settlement.Sportsbook.Soccer.UnitTests.Controllers;

public class SoccerControllerTests
{
    private readonly IMediator mediator;

    private readonly SoccerController controller;

    public SoccerControllerTests()
    {
        mediator = Substitute.For<IMediator>();
        controller = new SoccerController(mediator);
    }

    [Fact]
    public async Task GetMatchEarly_Always_ReturnOkStatus()
    {
        var request = new GetMatchEarlyRequest();
        mediator.Send(Arg.Any<GetMatchEarlyRequest>()).Returns(new MatchEarly());

        var actual = await controller.GetMatchEarly(request) as OkObjectResult;

        Assert.IsType<MatchEarly>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task SettleEarly_Always_ReturnOkStatus()
    {
        var request = new SettleEarlyRequest();
        mediator.Send(Arg.Any<SettleEarlyRequest>()).Returns(new Result());

        var actual = await controller.CalculateEarly(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnOkStatus()
    {
        var request = new GetMatchRequest();
        mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new Match());

        var actual = await controller.GetMatch(request) as OkObjectResult;

        Assert.IsType<Match>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task Settle_Always_ReturnOkStatus()
    {
        var request = new SettleRequest();
        mediator.Send(Arg.Any<SettleRequest>()).Returns(new Result());

        var actual = await controller.Calculate(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task checkStatus_Always_ReturnOkStatus()
    {
        var request = new CheckStatusRequest();
        mediator.Send(Arg.Any<CheckStatusRequest>()).Returns(new Result());

        var actual = await controller.CheckingStatus(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task Refund_Always_ReturnOkStatus()
    {
        var request = new RefundRequest();
        mediator.Send(Arg.Any<RefundRequest>()).Returns(new Result());

        var actual = await controller.Refund(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task RefundRunningThirdPartyTickets_Always_ReturnOkStatus()
    {
        var request = new RefundRunningThirdPartyTicketRequest();
        mediator.Send(Arg.Any<RefundRunningThirdPartyTicketRequest>()).Returns(new Result());

        var actual = await controller.RefundRunningThirdPartyTickets(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task MoveThirdPartyBetTickets_Always_ReturnOkStatus()
    {
        var request = new MoveBetRequest();
        mediator.Send(Arg.Any<MoveBetRequest>()).Returns(new Result());

        var actual = await controller.MoveThirdPartyBetTickets(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task ThirdPartyBetTicketsChecking_Always_ReturnOkStatus()
    {
        var request = new GetMatchDetailThirdPartyBetTicketsRequest();
        mediator.Send(Arg.Any<GetMatchDetailThirdPartyBetTicketsRequest>()).Returns([]);

        var actual = await controller.ThirdPartyBetTicketsChecking(request) as OkObjectResult;

        Assert.IsType<List<MatchMoveBetTicket>>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }
}