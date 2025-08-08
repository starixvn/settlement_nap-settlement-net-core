using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Handlers;
using Settlement.Setting.Requests;

namespace Settlement.Setting.UnitTests.Handlers
{
    public class UpdateSoccerSettingHandlerTests
    {
        private readonly SettingService settingService = Substitute.For<SettingService>();
        private readonly IDynamicRepository dynamicRepository = Substitute.For<IDynamicRepository>();
        private readonly LogService logService = Substitute.For<LogService>();
        private readonly INapSession napSession = Substitute.For<INapSession>();
        private readonly UpdateSoccerSettingHandler handler;

        public UpdateSoccerSettingHandlerTests()
        {
            napSession.UserId.Returns(123);
            handler = new UpdateSoccerSettingHandler(settingService, dynamicRepository, logService, napSession);
        }

        [Fact]
        public async Task HandleAsync_PayoutSettingEnabled_UpdatesPayoutAndRefund()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                MatchId = 2,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        Enabled = true
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        Enabled = false
                    }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoPayoutSoccer, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoDirect, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoRefund, Enabled = false }
                }
            };
            settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(new Result());
            await dynamicRepository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());
            await settingService.UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>());

            // Act
            var result = await handler.HandleAsync(command);

            // Assert
            Assert.NotNull(result);
            await settingService.Received(1).UpdateSettingLeague(Arg.Any<SettingLeagueRequest>());
            await dynamicRepository.Received(1).ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.Received(2).WriteLog(Arg.Any<LogCriteria>());
        }

        [Fact]
        public async Task HandleAsync_DirectSettingEnabled_UpdatesDirectAndRefund()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                MatchId = 2,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        Enabled = true
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        Enabled = false
                    }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoPayoutSoccer, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoDirect, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoRefund, Enabled = false }
                }
            };
            settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(new Result());

            await dynamicRepository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());
            await settingService.UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>());
            // Act
            var result = await handler.HandleAsync(command);

            // Assert
            Assert.NotNull(result);
            await settingService.Received(1).UpdateSettingLeague(Arg.Any<SettingLeagueRequest>());
            await dynamicRepository.Received(1).ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.Received(2).WriteLog(Arg.Any<LogCriteria>());
            await settingService.Received(1).UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>());
        }

        [Fact]
        public async Task HandleAsync_NeitherPayoutNorDirectEnabled_UpdatesBothAndRefund()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                MatchId = 2,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        Enabled = false
                    }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoPayoutSoccer, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoDirect, Enabled = false },
                    new UpdateResultSettingItem { SettleType = AutoSettleType.AutoRefund, Enabled = false }
                }
            };
            settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(new Result());
            await dynamicRepository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());
            await settingService.UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>());

            // Act
            var result = await handler.HandleAsync(command);

            // Assert
            Assert.NotNull(result);
            await settingService.Received(2).UpdateSettingLeague(Arg.Any<SettingLeagueRequest>());
            await dynamicRepository.Received(1).ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.Received(3).WriteLog(Arg.Any<LogCriteria>());
        }
    }
}
