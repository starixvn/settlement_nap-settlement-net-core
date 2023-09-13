using Settlement.Core.Constants;
using Settlement.EventManagement.Services;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services;

public class EventStatusServiceTests
{
    private readonly EventStatusService service;

    public EventStatusServiceTests()
    {
        service = new EventStatusServiceImp();
    }

    [Theory]
    [InlineData(2, EventStatus.Running, 1, EventStatus.IrregularTime1H)]
    [InlineData(2, EventStatus.Running, 0, EventStatus.Running)]
    [InlineData(0, EventStatus.Running, 1, EventStatus.Waiting)]
    [InlineData(1, EventStatus.Running, 1, EventStatus.Calculating)]
    public void NewEventStatus_Always_ReturnCorrectValue(int isCalculatingSingle, string eventStatus,
        int eventStatusReason, string newEventStatus)
    {
        // Arrange
        var match = new Match
        {
            IsCalculatingSingle = isCalculatingSingle,
            EventStatus = eventStatus,
            EventStatusReason = eventStatusReason
        };

        // Act
        var result = service.CheckProcessingStatus(match.EventStatus, match);

        // Assert
        Assert.Equal(newEventStatus, result);
    }
}