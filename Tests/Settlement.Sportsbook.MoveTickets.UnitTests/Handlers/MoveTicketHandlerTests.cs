using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Handlers;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Handlers
{
    public class MoveTicketHandlerTests
    {
        private readonly IMoveTicketService moveTicketService;
        private readonly PermissionService permissionService;
        private readonly MoveTicketMultipleServerService moveTicketMultipleServerService;
        private readonly MoveTicketHandler handler;

        public MoveTicketHandlerTests()
        {
            moveTicketService = Substitute.For<IMoveTicketService>();
            moveTicketMultipleServerService = Substitute.For<MoveTicketMultipleServerService>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            handler = new MoveTicketHandler(moveTicketService, permissionService, moveTicketMultipleServerService);
        }

        [Fact]
        public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
        {
            var listSport = new List<SportModel>();
            var permission = new Permission();
            moveTicketService.GetSportBook(Arg.Any<GetMatchRequest>()).Returns(listSport);
            permissionService.Permission.Returns(permission);

            var actual = await handler.Handle(new GetMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(permission, actual.Permission);
            Assert.Equal(listSport, actual.Sports);
        }

        //[Fact]
        //public async Task HandleMoveTicketRequest_Always_ReturnCorrectResult()
        //{
        //    var result = new Result();

        //    moveTicketService.MoveTicket(Arg.Any<MoveTicketRequest>()).Returns(result);

        //    var actual = await handler.Handle(new MoveTicketRequest(), new System.Threading.CancellationToken());

        //    Assert.Equal(result, actual);
        //}

        [Fact]
        public async Task HandleGetChildMatchRequest_Always_ReturnCorrectResult()
        {
            var result = new List<ChildMatch>();

            moveTicketService.GetChildMatch(Arg.Any<GetChildMatchRequest>()).Returns(result);

            var actual = await handler.Handle(new GetChildMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}