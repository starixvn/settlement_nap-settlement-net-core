using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Services;

public class ResultLabelServiceTests
{
    private readonly IResultLabelService service;

    public ResultLabelServiceTests()
    {
        service = new ResultLabelServiceImp();
    }

    [Fact]
    public void NextOneMinuteSetPiece_Always_ReturnsRightExpectedResultItem()
    {
        // Arrange
        var expectedResultItem = new ResultItemLabel { None = "No", Goal = "Yes <a title='Corner, Free Kick or Throw In'>(!)</a>" };

        // Act
        var actualResultItem = service.NextOneMinuteSetPiece();

        // Assert
        AssertExtension.AreEqual(expectedResultItem, actualResultItem);
    }

    [Fact]
    public void NextFiveMinutes_OddIsEmptied_ReturnsRightDefaultExpectedResultItem()
    {
        // Arrange
        var odd = string.Empty;
        var expectedResultItem = new ResultItemLabel
        {
            IsSetDefaultValue = true,
            Goal = "0.5",
            Corner = "0.5",
            FreeKick = "1.5",
            GoalKick = "0.5",
            ThrowIn = "2.5",
            Penalty = "0.5"
        };

        // Act
        var actualResultItem = service.NextFiveMinutes(odd);

        // Assert
        AssertExtension.AreEqual(expectedResultItem, actualResultItem);
    }

    [Fact]
    public void NextFiveMinutes_OddIsNotEmptied_ReturnsRightExpectedResultItem()
    {
        // Arrange
        var odd = "1:,2:0.7,3:0.5,4:1.5,5:0.5,6:2.5,7:,8:0.6";
        var expectedResultItem = new ResultItemLabel
        {
            Goal = "0.7",
            Corner = "0.5",
            FreeKick = "1.5",
            GoalKick = "0.5",
            ThrowIn = "2.5",
            Penalty = "0.6"
        };

        // Act
        var actualResultItem = service.NextFiveMinutes(odd);

        // Assert
        AssertExtension.AreEqual(expectedResultItem, actualResultItem);
    }
}