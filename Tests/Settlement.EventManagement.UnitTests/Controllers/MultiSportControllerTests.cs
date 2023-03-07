using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Models;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Controllers;

public class MultiSportControllerTests
{
    private readonly MultiSportController controller;

    private readonly IMediator mediator;

    public MultiSportControllerTests()
    {
        mediator = Substitute.For<IMediator>();
        controller = new MultiSportController(mediator);
    }

    [Fact]
    public void GetDate_ReturnRightValue()
    {
        // Act
        var actual = controller.GetDate() as OkObjectResult;

        // Assert
        Assert.IsType<DateSelection>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task Filter_Always_ReturnsListMatchesOnSports()
    {
        // Arrange
        mediator.Send(Arg.Any<FilterMultiSportRequest>()).Returns(new MultiSportModel());

        // Act
        var actual = await controller.Filter(new FilterMultiSportRequest()) as OkObjectResult;

        // Assert
        Assert.IsType<MultiSportModel>(actual.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task RefreshMatches_Always_ReturnsListMatches()
    {
        // Arrange

        mediator.Send(Arg.Any<RefreshMultiSportRequest>()).Returns(new List<Match>());

        // Act
        var actual = await controller.RefreshMatches(new RefreshMultiSportRequest()) as OkObjectResult;

        // Assert
        Assert.IsType<List<Match>>(actual.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task GetSports_Always_ReturnsListSports()
    {
        var request = new SportRequest();
        mediator.Send(Arg.Any<SportRequest>()).Returns(new List<Sport>());

        var actual = await controller.GetSports(request) as OkObjectResult;

        Assert.IsType<List<Sport>>(actual.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task GetLeagues_Always_ReturnsListLeagues()
    {
        var request = new LeagueRequest();
        mediator.Send(Arg.Any<LeagueRequest>()).Returns(new List<LeagueTypeModel>());

        var actual = await controller.GetLeagues(request) as OkObjectResult;

        Assert.IsType<List<LeagueTypeModel>>(actual.Value);
        Assert.Equal(200, actual.StatusCode);
    }
}