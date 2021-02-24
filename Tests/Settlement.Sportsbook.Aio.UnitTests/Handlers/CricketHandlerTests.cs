using NSubstitute;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Handlers;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers
{
    public class CricketHandlerTests
    {
        [Fact]
        public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new AioMatch();
            service.GetMatch(Arg.Any<GetMatchRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new GetMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSettleRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new ResultCricket();
            service.Settle(Arg.Any<SettleRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new SettleRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetRecalResultRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new List<MatchResultDetail>();
            service.GetRecalResult(Arg.Any<GetRecalResultRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new GetRecalResultRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckMarkedTicketsRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new MarkedTickets();
            service.CheckMarkedTickets(Arg.Any<CheckMarkedTicketsRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new CheckMarkedTicketsRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckMarkedTicketsParlayRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new MarkedTickets();
            service.CheckMarkedTicketsParlay(Arg.Any<CheckMarkedTicketsParlayRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new CheckMarkedTicketsParlayRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleRefundParlayRequest_Always_ReturnCorrectResult()
        {
            var service = Substitute.For<ICricketService>();
            var result = new Result();
            service.RefundParlay(Arg.Any<RefundParlayRequest>()).Returns(result);
            var handler = new CricketHandler(service);

            var actual = await handler.Handle(new RefundParlayRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}
