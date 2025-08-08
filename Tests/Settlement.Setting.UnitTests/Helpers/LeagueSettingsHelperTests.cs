using Settlement.Core.Constants;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Helpers;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.UnitTests.Helpers
{
    public class LeagueSettingsHelperTests
    {
        [Fact]
        public void FindDifferentProperties_ReturnsDifferences_WhenObjectsDiffer()
        {
            // Arrange
            var first = new UpdateLeagueSettingsCriteria
            {
                LeagueId = 1,
                RetryTime = 5,
                AutoType = 1,
                Main_HasTrader = true,
                Main_NumberProvider = 2,
                Main_PrimaryProvider = "A",
                Main_SecondaryProvider = "B",
                EAR_HasTrader = false,
                EAR_NumberProvider = 3,
                EAR_PrimaryProvider = "C",
                EAR_SecondaryProvider = "D"
            };
            var second = new UpdateLeagueSettingsCriteria
            {
                LeagueId = 1,
                RetryTime = 10,
                AutoType = 2,
                Main_HasTrader = false,
                Main_NumberProvider = 5,
                Main_PrimaryProvider = "X",
                Main_SecondaryProvider = "Y",
                EAR_HasTrader = true,
                EAR_NumberProvider = 4,
                EAR_PrimaryProvider = "Z",
                EAR_SecondaryProvider = "W"
            };

            // Act
            var result = LeagueSettingsHelper.FindDifferentProperties(first, second);

            // Assert
            Assert.Contains("Retry time: 5 -> 10", result);
            Assert.Contains("AutoType: 1 -> 2", result);
            Assert.Contains("Main: Has trader: True -> False", result);
            Assert.Contains("Main: Number Provider: 2 -> 5", result);
            Assert.Contains("Main: Primary provider: A -> X", result);
            Assert.Contains("Main: Secondary Provider: B -> Y", result);
            Assert.Contains("Early: Has trader: False -> True", result);
            Assert.Contains("Early: Number Provider: 3 -> 4", result);
            Assert.Contains("Early: Primary Provider: C -> Z", result);
            Assert.Contains("Early: Secondary Provider: D -> W", result);
        }

        [Fact]
        public void FindDifferentProperties_ReturnsEmpty_WhenObjectsAreEqual()
        {
            // Arrange
            var first = new UpdateLeagueSettingsCriteria
            {
                LeagueId = 1,
                RetryTime = 5,
                AutoType = 1,
                Main_HasTrader = true,
                Main_NumberProvider = 2,
                Main_PrimaryProvider = "A",
                Main_SecondaryProvider = "B",
                EAR_HasTrader = false,
                EAR_NumberProvider = 3,
                EAR_PrimaryProvider = "C",
                EAR_SecondaryProvider = "D"
            };
            var second = new UpdateLeagueSettingsCriteria
            {
                LeagueId = 1,
                RetryTime = 5,
                AutoType = 1,
                Main_HasTrader = true,
                Main_NumberProvider = 2,
                Main_PrimaryProvider = "A",
                Main_SecondaryProvider = "B",
                EAR_HasTrader = false,
                EAR_NumberProvider = 3,
                EAR_PrimaryProvider = "C",
                EAR_SecondaryProvider = "D"
            };

            // Act
            var result = LeagueSettingsHelper.FindDifferentProperties(first, second);

            // Assert
            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public void GetUpdateResultSettingItemDifferences_ReturnsDifferences()
        {
            // Arrange
            var first = new UpdateResultSettingItem
            {
                Enabled = true,
                WaitingTime = 10,
                IsTraderRequired = true,
                MinProvider = 1,
                Providers = new List<Provider>
                {
                    new Provider { SourceId = 1, SourceName = "A", IsActive = true, Priority = ProviderPriority.Primary },
                    new Provider { SourceId =2, SourceName = "B", IsActive = true, Priority = ProviderPriority.Secondary },
                    new Provider { SourceId = 3,  SourceName = "C", IsActive = false }
                }
            };
            var second = new UpdateResultSettingItem
            {
                Enabled = false,
                WaitingTime = 20,
                IsTraderRequired = false,
                MinProvider = 2,

                Providers = new List<Provider>
                {
                    new Provider { SourceId = 1, SourceName = "X", IsActive = true, Priority = ProviderPriority.Primary },
                    new Provider { SourceId = 2, SourceName = "Y", IsActive = true, Priority = ProviderPriority.Secondary },
                    new Provider { SourceId = 3, SourceName = "Z", IsActive = false }
                }
            };
            var properties = new List<string> { "Enabled", "WaitingTime", "IsTraderRequired", "MinProvider", "PrimaryProvider", "SecondaryProvider", "InactiveProvider" };

            // Act
            var result = LeagueSettingsHelper.GetUpdateResultSettingItemDifferences(first, second, properties);

            // Assert
            Assert.Contains("Enabled: True -> False", result);
            Assert.Contains("WaitingTime: 10 -> 20", result);
            Assert.Contains("IsTraderRequired: True -> False", result);
            Assert.Contains("MinProvider: 1 -> 2", result);
        }

        [Fact]
        public void AutoPayoutToText_ReturnsExpectedText()
        {
            // Act & Assert
            Assert.Equal("AutoPayout", LeagueSettingsHelper.AutoPayoutToText(AutoSettleType.AutoPayoutSoccer));
            Assert.Equal("DirectPayout", LeagueSettingsHelper.AutoPayoutToText(AutoSettleType.AutoDirect));
            Assert.Equal("AutoRefund", LeagueSettingsHelper.AutoPayoutToText(AutoSettleType.AutoRefund));
            Assert.Equal(string.Empty, LeagueSettingsHelper.AutoPayoutToText((AutoSettleType)999));
        }

        [Fact]
        public void GetActionLogId_ReturnsExpectedId()
        {
            // Act & Assert
            Assert.Equal(ActionId.AutoPayoutSettingLeague, LeagueSettingsHelper.GetActionLogId("League"));
            Assert.Equal(ActionId.AutoPayoutSettingMatch, LeagueSettingsHelper.GetActionLogId("Match"));
            Assert.Equal(0, LeagueSettingsHelper.GetActionLogId("Other"));
        }
    }
}