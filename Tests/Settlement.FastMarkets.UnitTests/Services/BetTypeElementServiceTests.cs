using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class BetTypeElementServiceTests
{
    private readonly IBetTypeElementService service;

    public BetTypeElementServiceTests()
    {
        service = new BetTypeElementServiceImp();
    }

    private List<BetType> ListBetTypesSelected(int betTypeId)
    {
        var resultItem0 = new ResultItem
        {
            Goal = true,
            Bookings = true,
            Corner = true
        };

        var resultItem1 = new ResultItem
        {
            Goal = false,
            Bookings = true,
            Corner = true
        };

        var betType = new BetType
        {
            BetTypeId = betTypeId,
            FastMarketResults = new List<FastMarketResult> {
                new () { BetType= betTypeId, Position =0, Checked = true, IsShow = true, ResultItem = resultItem0},
                new ()  { BetType= betTypeId, Position =1, Checked = true, IsShow = true, ResultItem = resultItem1}
            }
        };

        var betTypes = new List<BetType>();
        betTypes.Add(betType);

        return betTypes;
    }

    [Fact]
    public void GetBetTypes_ResultItemIsShowedAndChecked_ReturnsEmptyBetTypeElement()
    {
        // Arrange
        var betTypes = ListBetTypesSelected(221);
        const string actionName = "CAL";

        // Act
        var actual = service.GetBetTypes(betTypes, actionName);

        // Assert
        Assert.Single(actual);
    }

    [Fact]
    public void GetBetTypes_ActionNameIsUndo_ReturnsEmptyResultOnItemElement()
    {
        // Arrange
        const int betTypeId = 221;
        var betTypes = ListBetTypesSelected(betTypeId);
        const string actionName = "UNDO";

        // Act
        var actual = service.GetBetTypes(betTypes, actionName);

        // Assert
        var items = new List<ItemElement> {
            new ()  {Position =0, Result = string.Empty },
            new ()  {Position =1, Result = string.Empty }
        };

        var expectedBetTypes = new List<BetTypeElement>
        {
            new ()
            {
                Id = betTypeId,
                Items = items
            }
        };

        AssertExtension.AreEqual(expectedBetTypes, actual);
    }

    [Fact]
    public void GetBetTypes_ActionNameIsNotUndoAndBetTypeIsNextOneMinuteSetPiece_ReturnsExpectedResultOnItemElement()
    {
        // Arrange
        const int betTypeId = 225;
        var betTypes = ListBetTypesSelected(betTypeId);
        const string actionName = "CAL";

        // Act
        var actual = service.GetBetTypes(betTypes, actionName);

        // Assert
        var items = new List<ItemElement> {
            new ()  {Position =0, Result = "44" },
            new ()  {Position =1, Result = "68" }
        };

        var expectedBetTypes = new List<BetTypeElement>
        {
            new ()
            {
                Id = betTypeId,
                Items = items
            }
        };

        AssertExtension.AreEqual(expectedBetTypes, actual);
    }

    [Fact]
    public void GetBetTypes_ActionNameIsNotUndoAndBetTypeIsNotNextOneMinuteSetPiece_ReturnsExpectedResultOnItemElement()
    {
        // Arrange
        const int betTypeId = 222;
        var betTypes = ListBetTypesSelected(betTypeId);
        const string actionName = "CAL";

        // Act
        var actual = service.GetBetTypes(betTypes, actionName);

        // Assert
        var items = new List<ItemElement> {
            new ()  {Position =0, Result = "70" },
            new ()  {Position =1, Result = "68" }
        };

        var expectedBetTypes = new List<BetTypeElement>
        {
            new ()
            {
                Id = betTypeId,
                Items = items
            }
        };

        AssertExtension.AreEqual(expectedBetTypes, actual);
    }

    [Fact]
    public void GetBetTypes_BetTypeIsTimeMachineMinutes_ReturnsExpectedResult()
    {
        var betType = new BetType
        {
            BetTypeId = 228,
            FastMarketResults = new List<FastMarketResult>
            {
                new ()  { BetType = 228, Position = 1, Checked = true, IsShow = true, Result = 1 }
            }
        };
        var betTypes = new List<BetType>();
        betTypes.Add(betType);
        const string actionName = "CAL";

        var actual = service.GetBetTypes(betTypes, actionName);

        Assert.Single(actual);
    }
}