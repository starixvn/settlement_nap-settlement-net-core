using Settlement.FastMarkets.Controllers;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Xunit;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.UnitTests.Controllers
{
    public class FastMarketsControllerTests
    {
        private readonly FastMarketsController controller;

        private readonly IMediator mediator;

        public FastMarketsControllerTests()
        {
            mediator = Substitute.For<IMediator>();
            controller = new FastMarketsController(mediator);
        }

        [Fact]
        public void InitialFilter_Always_ReturnFastMarketFilter()
        {
            var actual = controller.InitialFilter() as OkObjectResult;

            Assert.IsType<FastMarketFilter>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GetBetTypeInterval_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<BetTypeIntervalRequest>()).Returns(new FastMarketModel());

            var actual = await controller.GetBetTypeInterval(new BetTypeIntervalRequest()) as OkObjectResult;

            Assert.IsType<FastMarketModel>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GetMatch_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<MatchDetailRequest>()).Returns(new MatchDetail());

            var actual = await controller.GetMatch(new MatchDetailRequest()) as OkObjectResult;

            Assert.IsType<MatchDetail>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task UpdateSettingMatch_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<SettingMatchRequest>()).Returns(new Result());

            var actual = await controller.UpdateSettingMatch(new SettingMatchRequest()) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task UpdateSettingLeague_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<SettingLeagueRequest>()).Returns(new Result());

            var actual = await controller.UpdateSettingLeague(new SettingLeagueRequest()) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task CheckingMarkedTickets_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(new MarkedTickets());

            var actual = await controller.CheckingMarkedTickets(new CheckingMarkedTicketsRequest()) as OkObjectResult;

            Assert.IsType<MarkedTickets>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task Settle_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<SettleRequest>()).Returns(new Result());

            var actual = await controller.Settle(new SettleRequest()) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task UpdateWaterBreakSetting_Always_ReturnCorrectType()
        {
            mediator.Send(Arg.Any<UpdateWaterBreakSettingRequest>()).Returns(new Result());

            var actual = await controller.UpdateWaterBreakSetting(new UpdateWaterBreakSettingRequest()) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}