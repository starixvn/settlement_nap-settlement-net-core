using AutoMapper;
using Fanex.Caching;
using Fanex.NAP.Client;
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

    private readonly CricketHandler handler;

    public CricketHandlerTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
        moveTicketService = Substitute.For<MoveTicketService>();
        moveActionService = Substitute.For<MoveActionService>();
        var napSession = Substitute.For<INapSession>();
        var cacheService = Substitute.For<ICacheService>();
        napSession.UserId = 1;
        cacheService.GetOrSet(Arg.Any<string>(), Arg.Any<Func<Permission>>(), Arg.Any<CacheItemOptions>()).Returns(new Permission());
        var permissionService = Substitute.For<PermissionService>(napSession, null, cacheService, null);
        handler = new CricketHandler(moveTicketService, permissionService, moveActionService);
    }

    [Fact]
    public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
    {
        var listSport = new List<SportModel>();
        moveTicketService.GetSportBook(Arg.Any<GetMatchRequest>()).Returns(listSport);

        var actual = await handler.Handle(new GetMatchRequest(), new CancellationToken());

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
            Sports = result,
            Permission = new Permission()
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