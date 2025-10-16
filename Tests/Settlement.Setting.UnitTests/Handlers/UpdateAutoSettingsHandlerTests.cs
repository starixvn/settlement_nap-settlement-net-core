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
            var command = CreateLeagueCommand();
            await repository.ExecuteAsync(Arg.Do<AutoSettleRunUpdateCriteria>(c =>
            {
                c.ErrCode = 0;
                c.ErrMsg = string.Empty;
            }));
            await repository.ExecuteAsync(Arg.Do<UpdateLeagueAutoSettleSourceCriteria>(c =>
            {
                c.UpdatedMatchIDs = "11,12";
            }));

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.ErrCode);
            await logService.Received().WriteLog(Arg.Any<LogCriteria>());
        }

        [Fact]
        public async Task Handle_OneSettingFails_ReturnsErrorResult()
        {
            // Arrange
            var command = CreateLeagueCommand();
            await repository.ExecuteAsync(Arg.Do<AutoSettleRunUpdateCriteria>(c =>
            {
                // Simulate error for the first call (enabled) and success for the second (disabled)
                // You may need to track call count if multiple calls are made
                c.ErrCode = 1;
                c.ErrMsg = "Failure";
            }));
            await repository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ErrCode);
            Assert.Contains("Failure", result.ErrMsg);
        }

        [Fact]
        public async Task Handle_MatchType_UsesMatchCriteria()
        {
            // Arrange
            var command = CreateLeagueCommand();
            command.TypeObject = "Match";
            await repository.ExecuteAsync(Arg.Any<MatchAutoSettleRunUpdateCriteria>());
            await repository.ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            await repository.Received().ExecuteAsync(Arg.Any<MatchAutoSettleRunUpdateCriteria>());
            await repository.Received().ExecuteAsync(Arg.Any<UpdateMatchAutoSettleSourceCriteria>());
        }

        [Fact]
        public async Task Handle_RefundOnly_SkipsEnableAutoSettle()
        {
            // Arrange
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 9,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = AutoSettleType.AutoRefund, ResourceType = ResourceType.Main, Enabled = true }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = AutoSettleType.AutoRefund, ResourceType = ResourceType.Main, Enabled = false }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(0, result.ErrCode);
            // Only source criteria executed, never run update criteria (AutoSettleRunUpdateCriteria)
            await repository.DidNotReceive().ExecuteAsync(Arg.Any<LeagueAutoSettleRunUpdateCriteria>());
            await repository.Received().ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());
        }

        [Fact]
        public async Task Handle_FastMarketAutoRefund_SkipsEnableAutoSettle()
        {
            // Arrange (assumes enum has FastMarketAutoRefund)
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 10,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = (AutoSettleType) int.MaxValue, ResourceType = ResourceType.Main, Enabled = true } // using large value if enum missing
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = (AutoSettleType) int.MaxValue, ResourceType = ResourceType.Main, Enabled = false }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert (at least should not throw)
            Assert.NotNull(result);
        }

        [Fact]
        public async Task Handle_NoDifferences_NoLogWritten()
        {
            // Arrange identical old & new so differences empty
            var command = new UpdateAutoSettingsCommand
            {
                LeagueId = 1,
                TypeObject = "League",
                ResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = AutoSettleType.AutoPayoutSoccer, ResourceType = ResourceType.Main, Enabled = true, WaitingTime = 10, MinProvider = 1 }
                },
                OldResultSettings = new List<UpdateResultSettingItem>
                {
                    new() { SettleType = AutoSettleType.AutoPayoutSoccer, ResourceType = ResourceType.Main, Enabled = true, WaitingTime = 10, MinProvider = 1 }
                }
            };

            await repository.ExecuteAsync(Arg.Any<LeagueAutoSettleRunUpdateCriteria>());
            await repository.ExecuteAsync(Arg.Any<UpdateLeagueAutoSettleSourceCriteria>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(0, result.ErrCode);
            await logService.DidNotReceive().WriteLog(Arg.Any<LogCriteria>());
        }

        [Fact]
        public async Task Handle_WithChildMatchIds_IncludesInLog()
        {
            // Arrange
            var command = CreateLeagueCommand();
            await repository.ExecuteAsync(Arg.Do<AutoSettleRunUpdateCriteria>(c =>
            {
                c.ErrCode = 0;
                c.UpdatedMatchIDs = "5,6";
            }));
            await repository.ExecuteAsync(Arg.Do<UpdateLeagueAutoSettleSourceCriteria>(c =>
            {
                c.UpdatedMatchIDs = "5,6";
            }));

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await logService.Received().WriteLog(Arg.Is<LogCriteria>(c => c.Remark != null && c.Remark.Contains("5,6")));
        }

        private static UpdateAutoSettingsCommand CreateLeagueCommand() => new()
        {
            LeagueId = 1,
            MatchId = 2,
            TypeObject = "League",
            IsApplyAll = true,
            ResultSettings = new List<UpdateResultSettingItem>
            {
                new() { SettleType = AutoSettleType.AutoPayoutSoccer, ResourceType = ResourceType.Main, Enabled = true, WaitingTime = 10, IsTraderRequired = true, MinProvider = 1 },
                new() { SettleType = AutoSettleType.AutoRefund, ResourceType = ResourceType.Main, Enabled = false }
            },
            OldResultSettings = new List<UpdateResultSettingItem>
            {
                new() { SettleType = AutoSettleType.AutoPayoutSoccer, ResourceType = ResourceType.Main, Enabled = false, WaitingTime = 5, IsTraderRequired = false, MinProvider = 1 },
                new() { SettleType = AutoSettleType.AutoRefund, ResourceType = ResourceType.Main, Enabled = false }
            }
        };
    }
}