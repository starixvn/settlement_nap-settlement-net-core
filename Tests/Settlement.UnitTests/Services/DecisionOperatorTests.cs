using Settlement.Services;
using Xunit;

namespace Settlement.UnitTests.Services;

public class DecisionOperatorTests
{
    [Fact]
    public void QuaternaryDecision_FirstConditionTrue_ReturnsFirstResult()
    {
        // Arrange
        const bool firstCondition = true;
        const int firstResult = 10;
        const bool secondCondition = false;
        const int secondResult = 20;
        const int defaultResult = 30;

        // Act
        var result = DecisionOperator.QuaternaryDecision(firstCondition, firstResult, secondCondition, secondResult, defaultResult);

        // Assert
        Assert.Equal(firstResult, result);
    }

    [Fact]
    public void QuaternaryDecision_SecondConditionTrue_ReturnsSecondResult()
    {
        // Arrange
        const bool firstCondition = false;
        const int firstResult = 10;
        const bool secondCondition = true;
        const int secondResult = 20;
        const int defaultResult = 30;

        // Act
        var result = DecisionOperator.QuaternaryDecision(firstCondition, firstResult, secondCondition, secondResult, defaultResult);

        // Assert
        Assert.Equal(secondResult, result);
    }

    [Fact]
    public void QuaternaryDecision_BothConditionsFalse_ReturnsDefaultResult()
    {
        // Arrange
        const bool firstCondition = false;
        const int firstResult = 10;
        const bool secondCondition = false;
        const int secondResult = 20;
        const int defaultResult = 30;

        // Act
        var result = DecisionOperator.QuaternaryDecision(firstCondition, firstResult, secondCondition, secondResult, defaultResult);

        // Assert
        Assert.Equal(defaultResult, result);
    }

    [Fact]
    public void QuinaryDecision_FirstConditionTrue_ReturnsFirstResult()
    {
        // Arrange
        const bool firstCondition = true;
        const int firstResult = 10;
        const bool secondCondition = false;
        const int secondResult = 20;
        const bool thirdCondition = false;
        const int thirdResult = 30;
        const int defaultResult = 40;

        // Act
        var result = DecisionOperator.QuinaryDecision(firstCondition, firstResult, secondCondition, secondResult, thirdCondition, thirdResult, defaultResult);

        // Assert
        Assert.Equal(firstResult, result);
    }

    [Fact]
    public void QuinaryDecision_SecondConditionTrue_ReturnsSecondResult()
    {
        // Arrange
        const bool firstCondition = false;
        const int firstResult = 10;
        const bool secondCondition = true;
        const int secondResult = 20;
        const bool thirdCondition = false;
        const int thirdResult = 30;
        const int defaultResult = 40;

        // Act
        var result = DecisionOperator.QuinaryDecision(firstCondition, firstResult, secondCondition, secondResult, thirdCondition, thirdResult, defaultResult);

        // Assert
        Assert.Equal(secondResult, result);
    }

    [Fact]
    public void QuinaryDecision_ThirdConditionTrue_ReturnsThirdResult()
    {
        // Arrange
        const bool firstCondition = false;
        const int firstResult = 10;
        const bool secondCondition = false;
        const int secondResult = 20;
        const bool thirdCondition = true;
        const int thirdResult = 30;
        const int defaultResult = 40;

        // Act
        var result = DecisionOperator.QuinaryDecision(firstCondition, firstResult, secondCondition, secondResult, thirdCondition, thirdResult, defaultResult);

        // Assert
        Assert.Equal(thirdResult, result);
    }

    [Fact]
    public void QuinaryDecision_AllConditionsFalse_ReturnsDefaultResult()
    {
        // Arrange
        const bool firstCondition = false;
        const int firstResult = 10;
        const bool secondCondition = false;
        const int secondResult = 20;
        const bool thirdCondition = false;
        const int thirdResult = 30;
        const int defaultResult = 40;

        // Act
        var result = DecisionOperator.QuinaryDecision(firstCondition, firstResult, secondCondition, secondResult, thirdCondition, thirdResult, defaultResult);

        // Assert
        Assert.Equal(defaultResult, result);
    }
}