using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Models;
using Settlement.Sportsbook.OtherSports.Controllers;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Controllers;

public class OtherSportsControllerTests
{
    private readonly OtherSportsController controller;

    private readonly IMediator mediator;

    public OtherSportsControllerTests()
    {
        mediator = Substitute.For<IMediator>();
        controller = new OtherSportsController(mediator);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnOtherSportsMatchModel()
    {
        // Arrange
        mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new OtherSportsMatchModel());

        // Act
        var result = await controller.GetMatch(new GetMatchRequest()) as OkObjectResult;

        // Assert
        Assert.IsType<OtherSportsMatchModel>(result?.Value);
    }

    [Fact]
    public async Task Calculate_Always_ReturnResult()
    {
        // Arrange
        mediator.Send(Arg.Any<CalculateRequest>()).Returns(new Result());

        // Act
        var result = await controller.Calculate(new CalculateRequest()) as OkObjectResult;

        // Assert
        Assert.IsType<Result>(result?.Value);
    }

    [Fact]
    public async Task CheckMarkedTickets_Always_ReturnMarkedTicketsModel()
    {
        // Arrange
        mediator.Send(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(new MarkedTickets());

        // Act
        var result = await controller.CheckMarkedTickets(new CheckingMarkedTicketsRequest()) as OkObjectResult;

        // Assert
        Assert.IsType<MarkedTickets>(result?.Value);
    }
}