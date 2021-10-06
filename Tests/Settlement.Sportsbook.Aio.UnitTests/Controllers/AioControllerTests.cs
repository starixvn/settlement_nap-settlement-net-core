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
    public class AioControllerTests
    {
        private readonly IMediator mediator;

        private readonly AioController controller;

        public AioControllerTests()
        {
            mediator = Substitute.For<IMediator>();
            controller = new AioController(mediator);
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
            mediator.Send(Arg.Any<SettleRequest>()).Returns(new Result());

            var actual = await controller.Settle(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
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
        public async Task GetRecalResult_Always_ReturnOkStatus()
        {
            var request = new GetRecalResultRequest();
            mediator.Send(Arg.Any<GetRecalResultRequest>()).Returns(new List<Models.ResultDetail>());

            var actual = await controller.GetRecalResult(request) as OkObjectResult;

            Assert.IsType<List<Models.ResultDetail>>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task VerifyNoRunningOdds_Always_ReturnOkStatus()
        {
            var request = new CheckRunningOddsRequest();
            mediator.Send(Arg.Any<CheckRunningOddsRequest>()).Returns(new Result());

            var actual = await controller.VerifyNoRunningOdds(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
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

        [Fact]
        public async Task SaveScore_Always_ReturnOkStatus()
        {
            var request = new SaveScoreRequest();
            mediator.Send(Arg.Any<SaveScoreRequest>()).Returns(new Result());

            var actual = await controller.SaveScore(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}