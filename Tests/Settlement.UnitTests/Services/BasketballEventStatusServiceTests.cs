using Settlement.Constants;
using Settlement.Models;
using Settlement.Services;
using Xunit;

namespace Settlement.UnitTests.Services;

public class BasketballEventStatusServiceTests
{
    private readonly BasketballEventStatusService service = new BasketballEventStatusServiceImp();

    [Fact]
    public void AdjustEventStatusAbandoned_ReturnsCorrectStatus_AbandonedSDTInRound()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new () { ResourceId = ResourceType.Halftime, SettlementStatusId = SettlementStatus.Abandoned},
            new () { ResourceId = ResourceType.Final, SettlementStatusId = SettlementStatus.Abandoned },
            new() { ResourceId = "Q1", SettlementStatusId = SettlementStatus.Abandoned }
           };
        const string expectedStatus = "Abandoned Q1";

        // Act
        var actualStatus = service.AdjustEventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

        // Assert
        Assert.Equal(expectedStatus, actualStatus);
    }

    [Fact]
    public void AdjustEventStatusAbandoned_ReturnsCorrectStatus_AbandonedSDTInFinal()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new () { ResourceId = ResourceType.Halftime, SettlementStatusId = SettlementStatus.Running},
            new () { ResourceId = ResourceType.Final, SettlementStatusId = SettlementStatus.Abandoned },
            new() { ResourceId = "Q1", SettlementStatusId = SettlementStatus.Running }
           };
        const string expectedStatus = "Abandoned FT";

        // Act
        var actualStatus = service.AdjustEventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

        // Assert
        Assert.Equal(expectedStatus, actualStatus);
    }

    [Fact]
    public void AdjustEventStatusAbandoned_ReturnsCorrectStatus_AbandonedSDTInHalfTime()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new () { ResourceId = ResourceType.Halftime, SettlementStatusId = SettlementStatus.Abandoned},
            new () { ResourceId = ResourceType.Final, SettlementStatusId = SettlementStatus.Abandoned },
            new() { ResourceId = "Q1", SettlementStatusId = SettlementStatus.Running }
           };
        const string expectedStatus = "Abandoned HT";

        // Act
        var actualStatus = service.AdjustEventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

        // Assert
        Assert.Equal(expectedStatus, actualStatus);
    }
}