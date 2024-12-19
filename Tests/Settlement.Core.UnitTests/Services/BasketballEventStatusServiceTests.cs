using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Xunit;

namespace Settlement.Core.UnitTests.Services;

public class AdjustEventStatusServiceTests
{
    private readonly AdjustEventStatusService service;

    public AdjustEventStatusServiceTests()
    {
        service = new AdjustEventStatusServiceImp();
    }

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
        var actualStatus = service.EventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

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
        var actualStatus = service.EventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

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
        var actualStatus = service.EventStatusAbandoned(EventStatus.Completed, resultDetails, SportType.BasketBall);

        // Assert
        Assert.Equal(expectedStatus, actualStatus);
    }
}