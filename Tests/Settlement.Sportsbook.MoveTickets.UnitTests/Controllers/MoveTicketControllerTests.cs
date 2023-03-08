using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Models;
using Settlement.Sportsbook.MoveTickets.Controllers;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Controllers;

public class MoveTicketControllerTests
{
    private readonly IMediator mediator;

    private readonly MoveTicketController controller;

    public MoveTicketControllerTests()
    {
        mediator = Substitute.For<IMediator>();
        controller = new MoveTicketController(mediator);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnOkStatus()
    {
        var request = new GetMatchRequest();
        mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new MultiSportModel());

        var actual = await controller.GetMatch(request) as OkObjectResult;

        Assert.IsType<MultiSportModel>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task MoveTicket_Always_ReturnOkStatus()
    {
        var request = new MoveTicketRequest();
        mediator.Send(Arg.Any<MoveTicketRequest>()).Returns(new Result());

        var actual = await controller.MoveTicket(request) as OkObjectResult;

        Assert.IsType<Result>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task GetChildMatch_Always_ReturnOkStatus()
    {
        var request = new GetChildMatchRequest();
        mediator.Send(Arg.Any<GetChildMatchRequest>()).Returns(new List<ChildMatch>());

        var actual = await controller.GetChildMatch(request) as OkObjectResult;

        Assert.IsType<List<ChildMatch>>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }
}