using NSubstitute;
using Settlement.Core.Models;
using Settlement.Sportsbook.Cricket.Handlers;
using Settlement.Sportsbook.Cricket.Models;
using Settlement.Sportsbook.Cricket.Requests;
using Settlement.Sportsbook.Cricket.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers
{
    public class CricketHandlerTests
    {
        private readonly CricketHandler handler;

        private readonly ICricketService service;
        public CricketHandlerTests()
        {
            service = Substitute.For<ICricketService>();
            handler = new CricketHandler(service);

        }
        [Fact]
        public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
        {
            var result = new AioMatch();
            service.GetMatch(Arg.Any<GetMatchRequest>()).Returns(result);

            var actual = await handler.Handle(new GetMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSettleRequest_Always_ReturnCorrectResult()
        {
            var result = new ResultCricket();
            service.Settle(Arg.Any<SettleRequest>()).Returns(result);

            var actual = await handler.Handle(new SettleRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetRecalResultRequest_Always_ReturnCorrectResult()
        {
            var result = new List<MatchResultDetail>();
            service.GetRecalResult(Arg.Any<GetRecalResultRequest>()).Returns(result);

            var actual = await handler.Handle(new GetRecalResultRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckMarkedTicketsRequest_Always_ReturnCorrectResult()
        {
            var result = new MarkedTickets();
            service.CheckMarkedTickets(Arg.Any<CheckMarkedTicketsRequest>()).Returns(result);

            var actual = await handler.Handle(new CheckMarkedTicketsRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckMarkedTicketsParlayRequest_Always_ReturnCorrectResult()
        {
            var result = new MarkedTickets();
            service.CheckMarkedTicketsParlay(Arg.Any<CheckMarkedTicketsParlayRequest>()).Returns(result);

            var actual = await handler.Handle(new CheckMarkedTicketsParlayRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleRefundParlayRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            service.RefundParlay(Arg.Any<RefundParlayRequest>()).Returns(result);

            var actual = await handler.Handle(new RefundParlayRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSettleChildMatchRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            service.SettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(result);

            var actual = await handler.Handle(new SettleChildMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}
