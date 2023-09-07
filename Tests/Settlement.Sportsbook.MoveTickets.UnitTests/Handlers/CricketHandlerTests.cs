using AutoMapper;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Handlers;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Handlers;

public class CricketHandlerTests
{
    private readonly MoveActionService moveActionService;

    private readonly MoveTicketService moveTicketService;

    private readonly PermissionService permissionService;

    private readonly CricketHandler handler;

    public CricketHandlerTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
        moveTicketService = Substitute.For<MoveTicketService>();
        moveActionService = Substitute.For<MoveActionService>();
        permissionService = Substitute.For<PermissionService>(null, null, null, null);
        handler = new CricketHandler(moveTicketService, permissionService, moveActionService);
    }

    [Fact]
    public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
    {
        var listSport = new List<SportModel>();
        var permission = new Permission();
        moveTicketService.GetSportBook(Arg.Any<GetMatchRequest>()).Returns(listSport);
        permissionService.Permission.Returns(permission);

        var actual = await handler.Handle(new GetMatchRequest(), new CancellationToken());

        Assert.Equal(permission, actual.Permission);
        Assert.Equal(listSport, actual.Sports);
    }

    [Fact]
    public async Task HandleGetChildMatchRequest_Always_ReturnCorrectMultiSportModel()
    {
        var result = new List<SportModel>
        {
            new()
            {
                Id = 1,
                Name = "Cricket"
            }
        };

        moveTicketService.GetSportBook(Arg.Any<GetMatchRequest>()).Returns(result);

        var actual = await handler.Handle(new GetMatchRequest(), new CancellationToken());
        var expected = new MultiSportModel
        {
            Sports = result
        };

        AssertExtension.AreEqual(expected, actual);
    }

    [Fact]
    public async Task HandleMoveTicketRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();

        moveActionService.MoveTicket(Arg.Any<MoveTicketRequest>()).Returns(result);

        var actual = await handler.Handle(new MoveTicketRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }
}