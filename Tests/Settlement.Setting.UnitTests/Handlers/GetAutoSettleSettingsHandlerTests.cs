using Fanex.Data.Repository;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Criteria;
using Settlement.Setting.Handlers;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.UnitTests.Handlers
{
    public class GetAutoSettleSettingsHandlerTests
    {
        private readonly IDynamicRepository repository = Substitute.For<IDynamicRepository>();
        private readonly IRefDataService refDataService = Substitute.For<IRefDataService>();
        private readonly GetAutoSettleSettingsHandler handler;

        public GetAutoSettleSettingsHandlerTests()
        {
            handler = new GetAutoSettleSettingsHandler(repository, refDataService);
        }

        [Fact]
        public async Task Handle_ReturnsExpectedResponse()
        {
            // Arrange
            var request = new AutoSettleSettingRequest
            {
                LeagueId = 1,
                MatchId = 2,
                SportType = 3,
                TypeObject = "League"
            };

            var payoutSetting = new AutoSettleSetting
            {
                Main_WaitingTime = 10,
                Main_HasTrader = true,
                Main_NumberProvider = 2,
                Main_PrimaryProvider = "1",
                Main_SecondaryProvider = "2",
                Main_InactiveProvider = "3",
                EAR_WaitingTime = 20,
                EAR_HasTrader = false,
                EAR_NumberProvider = 1,
                EAR_PrimaryProvider = "4",
                EAR_SecondaryProvider = "5",
                EAR_InactiveProvider = "6"
            };
            var refundSetting = new AutoSettleSetting { Main_WaitingTime = 30 };
            var autoSettingBit = 3;
            var providers = new List<ProviderInfo> { new ProviderInfo { SourceId = 1, SourceName = "P1" } };

            repository.GetAsync<AutoSettleSetting>(Arg.Any<AutoSettleLeagueSettingSelCriteria>()).Returns(payoutSetting, refundSetting);
            repository.GetAsync<int?>(Arg.Any<GetSettingCriteria>()).Returns(autoSettingBit);
            repository.FetchAsync<ProviderInfo>(Arg.Any<GetProviderInfoCriteria>()).Returns(providers);
            refDataService.GetLeagueName(Arg.Any<object>(), Arg.Any<bool>()).Returns("LeagueName");

            // Act
            var result = await handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(request.LeagueId, result.LeagueId);
            Assert.Equal(request.MatchId, result.MatchId);
            Assert.Equal("LeagueName", result.LeagueName);
            Assert.Equal(request.TypeObject, result.TypeObject);
            Assert.NotNull(result.ResultSettings);
            Assert.Equal(3, result.ResultSettings.Count);
        }

        [Fact]
        public async Task Handle_EmptyProviders_ReturnsEmptyProvidersList()
        {
            // Arrange
            var request = new AutoSettleSettingRequest
            {
                LeagueId = 1,
                MatchId = 2,
                SportType = 3,
                TypeObject = "League"
            };
            var payoutSetting = new AutoSettleSetting();
            var refundSetting = new AutoSettleSetting();
            var autoSettingBit = 0;
            var providers = new List<ProviderInfo>();

            repository.GetAsync<AutoSettleSetting>(Arg.Any<AutoSettleLeagueSettingSelCriteria>()).Returns(payoutSetting, refundSetting);
            repository.GetAsync<int?>(Arg.Any<GetSettingCriteria>()).Returns(autoSettingBit);
            repository.FetchAsync<ProviderInfo>(Arg.Any<GetProviderInfoCriteria>()).Returns(providers);
            refDataService.GetLeagueName(Arg.Any<object>(), Arg.Any<bool>()).Returns("LeagueName");

            // Act
            var result = await handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.All(result.ResultSettings, item => Assert.Empty(item.Providers ?? new List<Provider>()));
        }

        [Fact]
        public async Task Handle_RefundSettingIsNull_ThrowsException()
        {
            // Arrange
            var request = new AutoSettleSettingRequest
            {
                LeagueId = 1,
                MatchId = 2,
                SportType = 3,
                TypeObject = "League"
            };
            var payoutSetting = new AutoSettleSetting();
            AutoSettleSetting refundSetting = null;
            var autoSettingBit = 0;
            var providers = new List<ProviderInfo>();

            repository.GetAsync<AutoSettleSetting>(Arg.Any<AutoSettleLeagueSettingSelCriteria>()).Returns(payoutSetting, refundSetting);
            repository.GetAsync<int?>(Arg.Any<GetSettingCriteria>()).Returns(autoSettingBit);
            repository.FetchAsync<ProviderInfo>(Arg.Any<GetProviderInfoCriteria>()).Returns(providers);
            refDataService.GetLeagueName(Arg.Any<object>(), Arg.Any<bool>()).Returns("LeagueName");

            // Act & Assert
            await Assert.ThrowsAsync<System.NullReferenceException>(() => handler.Handle(request, CancellationToken.None));
        }
    }
}
