using System.Collections.Generic;
using System.Threading.Tasks;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Handlers;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using Xunit;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.UnitTests.Handlers
{
    public class GetMatchHandlerTests
    {
        private readonly IMatchDetailService matchDetailService;

        private readonly PermissionService permissionService;

        private readonly IFastMarketService fastMarketService;

        private readonly GetMatchHandler handler;

        public GetMatchHandlerTests()
        {
            matchDetailService = Substitute.For<IMatchDetailService>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            fastMarketService = Substitute.For<IFastMarketService>();
            handler = new GetMatchHandler(matchDetailService, permissionService, fastMarketService);
        }

        [Fact]
        public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
        {
            var result = new MatchDetail();
            result.AutoSettingIcon.Disabled = true;
            matchDetailService.MatchInfo(Arg.Any<int>()).Returns(result);
            permissionService.Permission.Returns(new Permission());

            var actual = await handler.Handle(new MatchDetailRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetBetType_Always_ReturnFastMarketModel()
        {
            var result = new FastMarketModel();
            var permission = new Permission();
            result.Permission = permission;
            fastMarketService.Query(Arg.Any<int>()).Returns(result);
            permissionService.Permission.Returns(permission);

            var actual = await handler.Handle(new BetTypeIntervalRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetLastestResultRequest_Always_ReturnCorrectResult()
        {
            var result = new List<FastMarketResult>();
            fastMarketService.GetLastestResult(Arg.Any<GetLastestResultRequest>()).Returns(result);
            permissionService.Permission.Returns(new Permission());

            var actual = await handler.Handle(new GetLastestResultRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }

        [Fact]
        public async Task HandleGetTimeMachineResultRequest_Always_ReturnCorrectResult()
        {
            var result = new List<TimeMachineResult>();
            fastMarketService.GetTimeMachineResult(Arg.Any<GetTimeMachineResultRequest>()).Returns(result);
            permissionService.Permission.Returns(new Permission());

            var actual = await handler.Handle(new GetTimeMachineResultRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual);
        }
    }
}