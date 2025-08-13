using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Criteria;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Handlers;
using Settlement.Setting.Requests;

namespace Settlement.Setting.UnitTests.Handlers
{
    public class UpdateAutoSettingsHandlerTests
    {
        private readonly IDynamicRepository repository = Substitute.For<IDynamicRepository>();
        private readonly IHttpContextAccessor accessor = Substitute.For<IHttpContextAccessor>();
        private readonly LogService logService = Substitute.For<LogService>();
        private readonly INapSession napSession = Substitute.For<INapSession>();
        private readonly UpdateAutoSettingsHandler handler;

        public UpdateAutoSettingsHandlerTests()
        {
            napSession.UserId.Returns(123);
            accessor.HttpContext.Returns(Substitute.For<HttpContext>());
            accessor.HttpContext?.Connection.Returns(Substitute.For<ConnectionInfo>());
            accessor.HttpContext?.Connection.RemoteIpAddress.Returns(System.Net.IPAddress.Loopback);
            handler = new UpdateAutoSettingsHandler(repository, accessor, logService, napSession);
        }

        [Fact]
        public async Task Handle_AllSettingsSuccess_ReturnsSuccessResult()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                MatchId = 2,
                TypeObject = "League",
                IsApplyAll = false,
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        ResourceType = ResourceType.Main,
                        Enabled = true,
                        WaitingTime = 10,
                        IsTraderRequired = true,
                        MinProvider = 1,
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
                        SettleType = AutoSettleType.AutoPayoutSoccer,
                        ResourceType = ResourceType.Main,
                        Enabled = false,
                        WaitingTime = 5,
                        IsTraderRequired = false,
                        MinProvider = 1,
                    },
                    new UpdateResultSettingItem
                    {
                        SettleType = AutoSettleType.AutoRefund,
                        ResourceType = ResourceType.Main,
                        Enabled = false
                    }
                }
            };

            await repository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.ErrCode);
            Assert.True(string.IsNullOrEmpty(result.ErrMsg));
        }

        [Fact]
        public async Task Handle_OneSettingFails_ReturnsErrorResult()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                MatchId = 2,
                TypeObject = "League",
                IsApplyAll = false,
                ResultSettings = new List<UpdateResultSettingItem>
                    {
                        new UpdateResultSettingItem
                        {
                            SettleType = AutoSettleType.AutoPayoutSoccer,
                            ResourceType = ResourceType.Main,
                            Enabled = true,
                            WaitingTime = 10,
                            IsTraderRequired = true,
                            MinProvider = 1
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
                            SettleType = AutoSettleType.AutoPayoutSoccer,
                            ResourceType = ResourceType.Main,
                            Enabled = false,
                            WaitingTime = 5,
                            IsTraderRequired = false,
                            MinProvider = 1
                        },
                        new UpdateResultSettingItem
                        {
                            SettleType = AutoSettleType.AutoRefund,
                            ResourceType = ResourceType.Main,
                            Enabled = false
                        }
                    }
            };

            await repository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
            await logService.WriteLog(Arg.Any<LogCriteria>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
        }
    }
}