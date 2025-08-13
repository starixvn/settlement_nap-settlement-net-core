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
    public class UpdateMatchSoccerSettingsHandlerTests
    {
        private readonly SettingService settingService = Substitute.For<SettingService>();
        private readonly IDynamicRepository dynamicRepository = Substitute.For<IDynamicRepository>();
        private readonly LogService logService = Substitute.For<LogService>();
        private readonly INapSession napSession = Substitute.For<INapSession>();
        private readonly UpdateMatchSoccerSettingsHandler handler;

        public UpdateMatchSoccerSettingsHandlerTests()
        {
            napSession.UserId.Returns(123);
            handler = new UpdateMatchSoccerSettingsHandler(settingService, dynamicRepository, logService, napSession);
        }

        [Fact]
        public async Task HandleAsync_DirectSettingEnabled_UpdatesDirectAndRefund()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                MatchId = 2,
                TypeObject = "Match",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        ResourceType = ResourceType.Main,
                        Enabled = true
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    }
                }
            };

            settingService.UpdateSettingMatch(Arg.Any<SettingMatchRequest>()).Returns(new Result());
            await dynamicRepository.ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());
            logService.WriteLog(Arg.Any<LogCriteria>()).Returns(Task.CompletedTask);

            // Act
            var result = await handler.HandleAsync(command);

            // Assert
            Assert.NotNull(result);
            await settingService.Received(1).UpdateSettingMatch(Arg.Any<SettingMatchRequest>());
            await dynamicRepository.Received(1).ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());
            await logService.Received(2).WriteLog(Arg.Any<LogCriteria>());
        }

        [Fact]
        public async Task HandleAsync_DirectSettingDisabled_UpdatesPayoutAndRefund()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                MatchId = 2,
                TypeObject = "Match",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        ResourceType = ResourceType.Main,
                        Enabled = true
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoDirect,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    }
                }
            };

            settingService.UpdateSettingMatch(Arg.Any<SettingMatchRequest>()).Returns(new Result());
            await dynamicRepository.ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());

            // Act
            var result = await handler.HandleAsync(command);

            // Assert
            Assert.NotNull(result);
            await settingService.Received(1).UpdateSettingMatch(Arg.Any<SettingMatchRequest>());
            await dynamicRepository.Received(1).ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());
            await logService.Received(2).WriteLog(Arg.Any<LogCriteria>());
        }
    }
}
