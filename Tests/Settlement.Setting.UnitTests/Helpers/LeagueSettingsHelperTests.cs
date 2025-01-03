using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Helpers;

namespace Settlement.Setting.UnitTests.Helpers;

public class LeagueSettingsHelperTests
{
    [Fact]
    public void FindDifferentProperties_ObjectsAreIdentical_ReturnEmpty()
    {
        // Arrange
        var firstObject = new UpdateLeagueSettingsCriteria
        {
            RetryTime = 10,
            AutoType = 2,
            Main_HasTrader = true,
            Main_NumberProvider = 2,
            Main_PrimaryProvider = "Provider2",
            Main_SecondaryProvider = "Provider3",
            EAR_HasTrader = false,
            EAR_NumberProvider = 1,
            EAR_PrimaryProvider = "Provider5",
            EAR_SecondaryProvider = "Provider6",
            LeagueId = 1
        };

        var secondObject = new UpdateLeagueSettingsCriteria
        {
            RetryTime = 10,
            AutoType = 2,
            Main_HasTrader = true,
            Main_NumberProvider = 2,
            Main_PrimaryProvider = "Provider2",
            Main_SecondaryProvider = "Provider3",
            EAR_HasTrader = false,
            EAR_NumberProvider = 1,
            EAR_PrimaryProvider = "Provider5",
            EAR_SecondaryProvider = "Provider6",
            LeagueId = 1
        };

        // Act
        var result = LeagueSettingsHelper.FindDifferentProperties(firstObject, secondObject);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void FindDifferentProperties_ObjectsDifferent_ReturnDifferences()
    {
        // Arrange
        var firstObject = new UpdateLeagueSettingsCriteria
        {
            RetryTime = 10,
            AutoType = 2,
            Main_HasTrader = true,
            Main_NumberProvider = 1,
            Main_PrimaryProvider = "Provider2",
            Main_SecondaryProvider = "Provider3",
            EAR_HasTrader = false,
            EAR_NumberProvider = 2,
            EAR_PrimaryProvider = "Provider5",
            EAR_SecondaryProvider = "Provider6",
            LeagueId = 1
        };

        var secondObject = new UpdateLeagueSettingsCriteria
        {
            RetryTime = 10,
            AutoType = 1,
            Main_HasTrader = false,
            Main_NumberProvider = 1,
            Main_PrimaryProvider = "Provider2",
            Main_SecondaryProvider = "Provider3",
            EAR_HasTrader = false,
            EAR_NumberProvider = 2,
            EAR_PrimaryProvider = "Provider5",
            EAR_SecondaryProvider = "Provider7",
            LeagueId = 1
        };

        // Act
        var result = LeagueSettingsHelper.FindDifferentProperties(firstObject, secondObject);

        // Assert
        Assert.NotEqual(string.Empty, result);
        Assert.Contains("AutoType: 2 -> 1", result);
        Assert.Contains("Main: Has trader: True -> False", result);
        Assert.Contains("Early: Secondary Provider: Provider6 -> Provider7", result);
    }
}