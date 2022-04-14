using NSubstitute;
using Settlement.Core.Models;
using Settlement.FastMarkets.Handlers;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Handlers
{
    public class UpdateSettingHandlerTests
    {
        private readonly ISettingService settingService;
        private readonly UpdateSettingHandler handler;

        public UpdateSettingHandlerTests()
        {
            settingService = Substitute.For<ISettingService>();
            handler = new UpdateSettingHandler(settingService);
        }

        [Fact]
        public async Task Handle_Always_ReturnResult()
        {
            var result = new Result();
            settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(result);
            settingService.UpdateSettingMatch(Arg.Any<SettingMatchRequest>()).Returns(result);
            settingService.UpdateWaterBreakSetting(Arg.Any<UpdateWaterBreakSettingRequest>()).Returns(result);

            var actual1 = await handler.Handle(new SettingLeagueRequest(), new System.Threading.CancellationToken());
            var actual2 = await handler.Handle(new SettingMatchRequest(), new System.Threading.CancellationToken());
            var actual3 = await handler.Handle(new UpdateWaterBreakSettingRequest(), new System.Threading.CancellationToken());

            Assert.Equal(result, actual1);
            Assert.Equal(result, actual2);
            Assert.Equal(result, actual3);
        }
    }
}