using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class FirstGoalLastGoalServiceTests
{
    private readonly FirstGoalLastGoalServiceImp service;
    private readonly FirstGoalLastGoalServiceImp partOfService;

    private const string FirstGoal = "first-goal";
    private const string LastGoal = "last-goal";
    private const string FirstLastGoal = "first-last-goal";
    private const string HtFirstGoal = "ht-first-goal";
    private const string HtLastGoal = "ht-last-goal";
    private const string HtFirstLastGoal = "ht-first-last-goal";

    public FirstGoalLastGoalServiceTests()
    {
        service = new FirstGoalLastGoalServiceImp();
        partOfService = Substitute.ForPartsOf<FirstGoalLastGoalServiceImp>();
        partOfService.When(x => x.CreateGoalIconModelOnBetStatus(Arg.Any<string>())).DoNotCallBase();
    }

    [Theory]
    [InlineData("")]
    [InlineData("FL:1-2")]
    public void GetHalftimeGoalByBetStatus_BetStatusNotContainsHalfTime_ReturnsHomeAndAwayIsNull(string betStatus)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };

        // Act
        var goalIcon = service.GetHalftimeGoalByBetStatus(query);

        // Assert
        Assert.True(goalIcon.Home == null && goalIcon.Away == null);
    }

    [Theory]
    [InlineData("1FL:1-1;FL:1-1")]
    [InlineData("1FL:1-2")]
    public void GetHalftimeGoalByBetStatus_BetStatusContainsHalfTime_ReturnsHomeIsFromCreateGoalIconModelOnBetStatus(string betStatus)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };
        partOfService.CreateGoalIconModelOnBetStatus(Arg.Any<string>()).Returns(new GoalModel { Home = homeFirstLastGoal });

        // Act
        var goalIcon = partOfService.GetHalftimeGoalByBetStatus(query);

        // Assert
        Assert.Equal("ht-" + homeFirstLastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("1FL:1-1;FL:1-1")]
    [InlineData("1FL:1-2")]
    public void HalftimeGoalByBetStatus_BetStatusContainsHalfTime_ReturnsAwayIsHtPrefixAndFromCreateGoalIconModelOnBetStatus(string betStatus)
    {
        // Arrange
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };
        partOfService.CreateGoalIconModelOnBetStatus(Arg.Any<string>()).Returns(new GoalModel { Away = awayFirstLastGoal });

        // Act
        var goalIcon = partOfService.GetHalftimeGoalByBetStatus(query);

        // Assert
        Assert.Equal("ht-" + awayFirstLastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("")]
    [InlineData("1FL:1-2")]
    public void FullTimeGoal_BetStatusNotContainsFullTime_ReturnsHomeIsNull(string betStatus)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };

        // Act
        var goalIcon = service.GetFullTimeGoalByBetStatus(query);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Theory]
    [InlineData("1FL:1-1;FL:1-1")]
    [InlineData("FL:1-2")]
    public void FullTimeGoal_BetStatusContainsFullTime_ReturnsHomeIsFromCreateGoalIconModelOnBetStatus(string betStatus)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };
        partOfService.CreateGoalIconModelOnBetStatus(Arg.Any<string>()).Returns(new GoalModel { Home = homeFirstLastGoal });

        // Act
        var goalIcon = partOfService.GetFullTimeGoalByBetStatus(query);

        // Assert
        Assert.Equal(homeFirstLastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("1FL:1-1;FL:1-1")]
    [InlineData("FL:1-2")]
    public void FullTimeGoal_BetStatusContainsFullTime_ReturnsAwayIsFromCreateGoalIconModelOnBetStatus(string betStatus)
    {
        // Arrange
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };
        partOfService.CreateGoalIconModelOnBetStatus(Arg.Any<string>()).Returns(new GoalModel { Away = awayFirstLastGoal });

        // Act
        var goalIcon = partOfService.GetFullTimeGoalByBetStatus(query);

        // Assert
        Assert.Equal(awayFirstLastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("")]
    [InlineData("1FL:1-2")]
    public void FullTimeGoal_BetStatusNotContainsFullTime_ReturnsAwayIsNull(string betStatus)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus
        };

        // Act
        var goalIcon = service.GetFullTimeGoalByBetStatus(query);

        // Assert
        Assert.Null(goalIcon.Away);
    }

    [Theory]
    [InlineData("")]
    [InlineData("1,2")]
    public void CreateGoalIconModelOnBetStatus_BetStatusHaveNoDash_ReturnsHomeAndAwayIsEmpty(string betStatus)
    {
        // Act
        var actual = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.True(string.IsNullOrWhiteSpace(actual.Home) && string.IsNullOrWhiteSpace(actual.Away));
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithHomeHasBothFirstAndLastGoal_ReturnsHomeIsFirstLastGoal()
    {
        // Arrange
        var betStatus = "1-1";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstLastGoal, goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithHomeHasFirstGoalOnly_ReturnsHomeIsFirstGoal()
    {
        // Arrange
        var betStatus = "1-2";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstGoal, goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithHomeHasLastGoalOnly_ReturnsHomeIsLastGoal()
    {
        // Arrange
        var betStatus = "2-1";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(LastGoal, goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithAwayHasBothFirstAndLastGoal_ReturnsAwayIsFirstLastGoal()
    {
        // Arrange
        var betStatus = "2-2";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstLastGoal, goalModel.Away);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithAwayHasFirstGoalOnly_ReturnsAwayIsFirstGoal()
    {
        // Arrange
        var betStatus = "2-1";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstGoal, goalModel.Away);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusWithAwayHasLastGoalOnly_ReturnsAwayIsLastGoal()
    {
        // Arrange
        var betStatus = "1-2";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(LastGoal, goalModel.Away);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasNoFirstAndLastGoal_ReturnsHomeIsNull()
    {
        // Arrange
        var betStatus = "0-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Null(goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasNoFirstAndLastGoal_ReturnsAwayIsNull()
    {
        // Arrange
        var betStatus = "0-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Null(goalModel.Away);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasLastGoalWithNoValueAndFirstGoalIsHome_ReturnsHomeIsHalfTimeFirstGoal()
    {
        // Arrange
        var betStatus = "1-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstGoal, goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasLastGoalWithNoValueAndFirstGoalIsHome_ReturnsAwayIsNull()
    {
        // Arrange
        var betStatus = "1-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Null(goalModel.Away);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasFirstGoalWithNoValueAndLastGoalIsAway_ReturnsHomeIsNull()
    {
        // Arrange
        var betStatus = "2-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Null(goalModel.Home);
    }

    [Fact]
    public void CreateGoalIconModelOnBetStatus_BetStatusHasLastGoalWithNoValueAndFirstGoalIsAway_ReturnsAwayIsHalfTimeFirstGoal()
    {
        // Arrange
        var betStatus = "2-0";

        // Act
        var goalModel = service.CreateGoalIconModelOnBetStatus(betStatus);

        // Assert
        Assert.Equal(FirstGoal, goalModel.Away);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("AH")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasNoSemicolon_ReturnsHomeIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("AH")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasNoSemicolon_ReturnsAwayIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Away);
    }

    [Theory]
    [InlineData("H;")]
    [InlineData("Hh;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstLastIsH_ReturnsHomeIsHtFirstLast(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtFirstLastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("H;")]
    [InlineData("Hh;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstLastIsH_ReturnsAwayIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Away);
    }

    [Theory]
    [InlineData("A;")]
    [InlineData("Aa;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstLastIsA_ReturnsAwayIsHtFirstLast(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtFirstLastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("A;")]
    [InlineData("Aa;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstLastIsA_ReturnsHomeIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Theory]
    [InlineData("AAH;")]
    [InlineData("Ah;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstIsAAndLastIsH_ReturnsHomeIsHtLastGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtLastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("AAH;")]
    [InlineData("Ah;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstIsAAndLastIsH_ReturnsAwayIsHtFirstGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtFirstGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("HHa;")]
    [InlineData("hA;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstIsHAndLastIsA_ReturnsAwayIsHtLastGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtLastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("HHa;")]
    [InlineData("haa;")]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonAndFirstIsHAndLastIsA_ReturnsHomeIsHtFirstGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Equal(HtFirstGoal, goalIcon.Home);
    }

    [Fact]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonButInvalid_ReturnsHomeIsNull()
    {
        // Arrange
        const string goalRecord = "m;a";

        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Fact]
    public void GetHalftimeGoalByGoalRecord_GoalRecordHasSemicolonButInvalid_ReturnsAwayIsNull()
    {
        // Arrange
        const string goalRecord = ";a";

        // Act
        var goalIcon = service.GetHalftimeGoalByGoalRecord(goalRecord);

        // Assert
        Assert.Null(goalIcon.Away);
    }

    [Theory]
    [InlineData("H;")]
    [InlineData("Hh;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstLastIsH_ReturnsHomeIsFirstLast(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(FirstLastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("H;")]
    [InlineData("Hh;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstLastIsH_ReturnsAwayIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Null(goalIcon.Away);
    }

    [Theory]
    [InlineData("A;")]
    [InlineData("Aa;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstLastIsA_ReturnsAwayIsFirstLast(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(FirstLastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("A;")]
    [InlineData("Aa;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstLastIsA_ReturnsHomeIsNull(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Theory]
    [InlineData("AAH;")]
    [InlineData("Ah;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstIsAAndLastIsH_ReturnsHomeIsLastGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(LastGoal, goalIcon.Home);
    }

    [Theory]
    [InlineData("AAH;")]
    [InlineData("Ah;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstIsAAndLastIsH_ReturnsAwayIsFirstGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(FirstGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("HHa;")]
    [InlineData("hA;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstIsHAndLastIsA_ReturnsAwayIsLastGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(LastGoal, goalIcon.Away);
    }

    [Theory]
    [InlineData("HHa;")]
    [InlineData("haa;")]
    public void GetFullTimeGoalByGoalRecord_IsSettledAndGoalRecordHasFirstIsHAndLastIsA_ReturnsHomeIsFirstGoal(string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, true);

        // Assert
        Assert.Equal(FirstGoal, goalIcon.Home);
    }

    [Theory]
    [CombinatorialData]
    public void GetFullTimeGoalByGoalRecord_GoalRecordIsInvalid_ReturnsHomeIsNull(
        [CombinatorialValues(true, false)] bool isSettled,
        [CombinatorialValues("M", "Mn")] string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, isSettled);

        // Assert
        Assert.Null(goalIcon.Home);
    }

    [Theory]
    [CombinatorialData]
    public void GetFullTimeGoalByGoalRecord_GoalRecordIsInvalid_ReturnsAwayIsNull(
        [CombinatorialValues(true, false)] bool isSettled,
        [CombinatorialValues("M", "Mn")] string goalRecord)
    {
        // Act
        var goalIcon = service.GetFullTimeGoalByGoalRecord(goalRecord, isSettled);

        // Assert
        Assert.Null(goalIcon.Away);
    }
}