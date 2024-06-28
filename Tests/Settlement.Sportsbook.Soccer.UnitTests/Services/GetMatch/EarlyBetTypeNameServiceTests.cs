using Settlement.Services;
using static Settlement.Constants.BetType;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.GetMatch;

using Soccer.Services.GetMatch;

public class EarlyBetTypeNameServiceTests
{
    private readonly IRefDataService refDataService;

    private readonly EarlyBetTypeNameService service;

    public EarlyBetTypeNameServiceTests()
    {
        refDataService = Substitute.For<IRefDataService>();
        service = new EarlyBetTypeNameServiceImp(refDataService);
    }

    [Theory]
    [InlineData("38201", 1)]
    [InlineData("38202", 2)]
    [InlineData("38203", 3)]
    [InlineData("38204", 4)]
    [InlineData("38205", 5)]
    [InlineData("38206", 8)]
    [InlineData("39805", 0)]
    public void GetGroupMap_ReturnPenaltyShootOutGroup_BetTypeNotCornerOrGoal(string resourceId, int expect)
    {
        var actual = service.GetGroupMap(1, resourceId);

        Assert.Equal(expect, actual);
    }

    [Theory]
    [InlineData(SoccerBetType.TimeOfFirstCorner, 10)]
    [InlineData(SoccerBetType.TimeOfSecondCorner, 10)]
    [InlineData(SoccerBetType.ExtraTimeNextGoal, 7)]
    [InlineData(SoccerBetType.FirstGoalMethod, 9)]
    [InlineData(SoccerBetType.TimeOfFirstGoal, 9)]
    public void GetGroupMap_ReturnOtherGroup_BetTypeCornerOrGoal(int betTypeId, int expect)
    {
        var actual = service.GetGroupMap(betTypeId, "");

        Assert.Equal(actual, expect);
    }

    [Theory]
    [InlineData(SoccerBetType.ExtraTimeNextGoal, "39805", "Goal 5")]
    [InlineData(SoccerBetType.HomePenaltyShootoutOverUnder, "", "Penalty Shootout First 10 - Home Score")]
    [InlineData(SoccerBetType.AwayPenaltyShootoutOverUnder, "", "Penalty Shootout First 10 - Away Score")]
    public void GetBetTypeName_ReturnBetTypeName_BetTypeCantGetByRefService(int betTypeId, string resourceId, string betTypeName)
    {
        var actualBetTypeName = service.GetBetTypeName(betTypeId, resourceId);

        Assert.Equal(actualBetTypeName, betTypeName);
    }

    [Theory]
    [InlineData(SoccerBetType.PenaltyShootoutBothOneNeither, "39801", "01")]
    [InlineData(SoccerBetType.PenaltyShootout1X2, "39802", "02")]
    [InlineData(SoccerBetType.PenaltyWoodwork, "39803", "03")]
    [InlineData(SoccerBetType.HomePenaltyShootout, "39804", "04")]
    [InlineData(SoccerBetType.AwayPenaltyShootout, "39805", "05")]
    public void GetBetTypeName_CallRefDataService_BetTypeCanGetByRefService(int betTypeId, string resourceId, string round)
    {
        service.GetBetTypeName(betTypeId, resourceId);

        refDataService.Received().GetBetTypeName(betTypeId, round);
    }

    [Fact]
    public void GetBetTypeName_CallRefDataService_BetTypeNotInCases()
    {
        const int betType = 999;
        service.GetBetTypeName(betType, "");

        refDataService.Received().GetBetTypeName(betType);
    }
}