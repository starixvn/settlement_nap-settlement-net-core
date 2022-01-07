using NSubstitute;
using Settlement.Core.Models;
using System.Threading.Tasks;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Handlers;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Handlers
{
    public class SoccerHandlerTests
    {
        private readonly SoccerHandler handler;

        private readonly IMatchService matchService;
        private readonly ICalculateService calculateService;
        private readonly IInstantCalculateService instantCalculateService;

        public SoccerHandlerTests()
        {
            matchService = Substitute.For<IMatchService>();
            calculateService = Substitute.For<ICalculateService>();
            instantCalculateService = Substitute.For<IInstantCalculateService>();
            handler = new SoccerHandler(matchService, calculateService, instantCalculateService);
        }

        [Fact]
        public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
        {
            var result = new Match();
            matchService.GetMatch(Arg.Any<GetMatchRequest>()).Returns(result);

            var actual = await handler.Handle(new GetMatchRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSettleRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            calculateService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

            var actual = await handler.Handle(new SettleRequest { ActionName = ActionType.CalculateAll }, new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleSettleRequest_Always_ReturnCorrectResultWithUncal()
        {
            var result = new Result();
            calculateService.UnCalculate(Arg.Any<SettleRequest>()).Returns(result);

            var actual = await handler.Handle(new SettleRequest { ActionName = ActionType.Uncalculate }, new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetLastestMatchDetailRequest_Always_ReturnCorrectMatchDetail()
        {
            var result = new MatchDetail();
            matchService.GetLastestMatchDetail(Arg.Any<GetLastestMatchDetailRequest>()).Returns(result);

            var actual = await handler.Handle(new GetLastestMatchDetailRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleCheckStatusRequest_Always_ReturnCorrectResult()
        {
            var result = new Result();
            calculateService.CheckStatus(Arg.Any<CheckStatusRequest>()).Returns(result);

            var actual = await handler.Handle(new CheckStatusRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}