using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Sportsbook.Cricket.Controllers;
using Settlement.Sportsbook.Cricket.Models;
using Settlement.Sportsbook.Cricket.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Controllers
{
    public class CricketControllerTests
    {
        private readonly IMediator mediator;


        private readonly CricketController controller;
        public CricketControllerTests()
        {
            mediator = Substitute.For<IMediator>();
            controller = new CricketController(mediator);
        }

        [Fact]
        public async Task GetMatch_Always_ReturnOkStatus()
        {
            var request = new GetMatchRequest();
            mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new AioMatch());

            var actual = await controller.GetMatch(request) as OkObjectResult;

            Assert.IsType<AioMatch>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task Settle_Always_ReturnOkStatus()
        {
            var request = new SettleRequest();
            mediator.Send(Arg.Any<SettleRequest>()).Returns(new ResultCricket());

            var actual = await controller.Settle(request) as OkObjectResult;

            Assert.IsType<ResultCricket>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task CheckMarkedTickets_Always_ReturnOkStatus()
        {
            var request = new CheckMarkedTicketsRequest();
            mediator.Send(Arg.Any<CheckMarkedTicketsRequest>()).Returns(new MarkedTickets());

            var actual = await controller.CheckMarkedTickets(request) as OkObjectResult;

            Assert.IsType<MarkedTickets>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task CheckMarkedTicketsParlay_Always_ReturnOkStatus()
        {
            var request = new CheckMarkedTicketsParlayRequest();
            mediator.Send(Arg.Any<CheckMarkedTicketsParlayRequest>()).Returns(new MarkedTickets());

            var actual = await controller.CheckMarkedTicketsParlay(request) as OkObjectResult;

            Assert.IsType<MarkedTickets>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task RefundParlay_Always_ReturnOkStatus()
        {
            var request = new RefundParlayRequest();
            mediator.Send(Arg.Any<RefundParlayRequest>()).Returns(new Result());

            var actual = await controller.RefundParlay(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GetRecalResult_Always_ReturnOkStatus()
        {
            var request = new GetRecalResultRequest();
            mediator.Send(Arg.Any<GetRecalResultRequest>()).Returns(new List<MatchResultDetail>());

            var actual = await controller.GetRecalResult(request) as OkObjectResult;

            Assert.IsType<List<MatchResultDetail>>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task SettleChildMatch_Always_ReturnOkStatus()
        {
            var request = new SettleChildMatchRequest();
            mediator.Send(Arg.Any<SettleChildMatchRequest>()).Returns(new Result());

            var actual = await controller.SettleChildMatch(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}
