using NSubstitute;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Handlers;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers
{
    public class AioHandlerTests
    {
        private readonly AioHandler handler;

        private readonly IAioService service;
        public AioHandlerTests()
        {
            service = Substitute.For<IAioService>();
            handler = new AioHandler(service);

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
            var result = new Result();
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
        public async Task HandleRefundParlayRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            service.RefundParlay(Arg.Any<RefundParlayRequest>()).Returns(result);

            var actual = await handler.Handle(new RefundParlayRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckRunningOddsRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            service.VerifyNoRunningOdds(Arg.Any<CheckRunningOddsRequest>()).Returns(result);

            var actual = await handler.Handle(new CheckRunningOddsRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSaveScoreRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            service.SaveScore(Arg.Any<SaveScoreRequest>()).Returns(result);

            var actual = await handler.Handle(new SaveScoreRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

    }
}
