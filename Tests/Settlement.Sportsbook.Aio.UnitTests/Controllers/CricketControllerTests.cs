using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Controllers;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Controllers
{
    public class CricketControllerTests
    {
        [Fact]
        public async Task GetMatch_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new GetMatchRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new Match());

            var actual = await controller.GetMatch(request) as OkObjectResult;

            Assert.IsType<Match>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task Settle_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new SettleRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<SettleRequest>()).Returns(new Result());

            var actual = await controller.Settle(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task CheckMarkedTickets_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new CheckMarkedTicketsRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<CheckMarkedTicketsRequest>()).Returns(new MarkedTickets());

            var actual = await controller.CheckMarkedTickets(request) as OkObjectResult;

            Assert.IsType<MarkedTickets>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task CheckMarkedTicketsParlay_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new CheckMarkedTicketsParlayRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<CheckMarkedTicketsParlayRequest>()).Returns(new MarkedTickets());

            var actual = await controller.CheckMarkedTicketsParlay(request) as OkObjectResult;

            Assert.IsType<MarkedTickets>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task RefundParlay_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new RefundParlayRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<RefundParlayRequest>()).Returns(new Result());

            var actual = await controller.RefundParlay(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GetRecalResult_Always_ReturnOkStatus()
        {
            var mediator = Substitute.For<IMediator>();
            var request = new GetRecalResultRequest();
            var controller = new CricketController(mediator);
            mediator.Send(Arg.Any<GetRecalResultRequest>()).Returns(new List<MatchResultDetail>());

            var actual = await controller.GetRecalResult(request) as OkObjectResult;

            Assert.IsType<List<MatchResultDetail>>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}
