using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Settlement.Sportsbook.Soccer.Controllers;
using System.Threading.Tasks;
using Xunit;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Controllers
{
    public class SoccerControllerTests
    {
        private readonly IMediator mediator;

        private readonly SoccerController controller;

        public SoccerControllerTests()
        {
            mediator = Substitute.For<IMediator>();
            controller = new SoccerController(mediator);
        }

        [Fact]
        public async Task GetMatch_Always_ReturnOkStatus()
        {
            var request = new GetMatchRequest();
            mediator.Send(Arg.Any<GetMatchRequest>()).Returns(new Match());

            var actual = await controller.GetMatch(request) as OkObjectResult;

            Assert.IsType<Match>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task Settle_Always_ReturnOkStatus()
        {
            var request = new SettleRequest();
            mediator.Send(Arg.Any<SettleRequest>()).Returns(new Result());

            var actual = await controller.Calculate(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task checkStatus_Always_ReturnOkStatus()
        {
            var request = new CheckStatusRequest();
            mediator.Send(Arg.Any<CheckStatusRequest>()).Returns(new Result());

            var actual = await controller.CheckingStatus(request) as OkObjectResult;

            Assert.IsType<Result>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GEtLastestMatchDetail_Always_ReturnOkStatus()
        {
            var request = new GetLastestMatchDetailRequest();
            mediator.Send(Arg.Any<GetLastestMatchDetailRequest>()).Returns(new MatchDetail());

            var actual = await controller.GetLastestMatchDetail(request) as OkObjectResult;

            Assert.IsType<MatchDetail>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}