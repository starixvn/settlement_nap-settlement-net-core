using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement.UnitTests.Controllers;

public class MultiSportControllerTests
{
    private readonly MultiSportController controller;

    private readonly IMediator mediator;
    //private readonly PermissionService permissionService;
    //private readonly HttpService httpService;


    public MultiSportControllerTests()
    {
        mediator = Substitute.For<IMediator>();
        var napSession = Substitute.For<INapSession>();
        napSession.UserId = 1;

        var napSettings = Substitute.For<INapSettings>();
        var userService = Substitute.For<IUserService>();
        var permisstionService = Substitute.For<PermissionService>(napSession, userService, napSettings);
        permisstionService.Permission.Returns(new Permission());

        controller = new MultiSportController(mediator, permisstionService, null);
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
        Assert.IsType<MultiSportModel>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }


    [Fact]
    public async Task GetSports_Always_ReturnsListSports()
    {
        var request = new SportRequest();
        mediator.Send(Arg.Any<SportRequest>()).Returns([]);

        var actual = await controller.GetSports(request) as OkObjectResult;

        Assert.IsType<List<Sport>>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }

    [Fact]
    public async Task GetLeagues_Always_ReturnsListLeagues()
    {
        var request = new LeagueRequest();
        mediator.Send(Arg.Any<LeagueRequest>()).Returns([]);

        var actual = await controller.GetLeagues(request) as OkObjectResult;

        Assert.IsType<List<LeagueTypeModel>>(actual?.Value);
        Assert.Equal(200, actual.StatusCode);
    }
}