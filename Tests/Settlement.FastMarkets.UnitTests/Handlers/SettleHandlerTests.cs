using NSubstitute;
using Settlement.Core.Models;
using Settlement.FastMarkets.Handlers;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Handlers
{
    public class SettleHandlerTests
    {
        private readonly IFastMarketService fastMarketService;

        private readonly IMatchDetailService matchDetailService;

        private readonly SettleHandler handler;

        public SettleHandlerTests()
        {
            fastMarketService = Substitute.For<IFastMarketService>();
            matchDetailService = Substitute.For<IMatchDetailService>();
            handler = new SettleHandler(fastMarketService, matchDetailService);
        }

        [Fact]
        public async Task HandleSettleRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            fastMarketService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

            var actual = await handler.Handle(new SettleRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckingMarkedTicketsRequest_Always_ReturnCorrectResult()
        {
            var result = new MarkedTickets();
            matchDetailService.CheckingMarkedTickets(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(result);

            var actual = await handler.Handle(new CheckingMarkedTicketsRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}