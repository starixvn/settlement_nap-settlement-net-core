using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class EventCounterElementServiceTests
{
    private readonly IEventCounterElementService service;

    public EventCounterElementServiceTests()
    {
        var eventCounterResultService = Substitute.For<IEventCounterResultService>();
        service = new EventCounterElementServiceImp(eventCounterResultService);
    }

    [Fact]
    public void GetEventCounters_EventCountersIsEmpty_ReturnsEmptyCounterElement()
    {
        // Act
        var counterElement = service.GetEventCounters(new List<EventCounter>());

        // Assert
        Assert.Empty(counterElement);
    }

    [Fact]
    public void GetEventCounters_HasEventCounters_ReturnsSixItemsCounterElement()
    {
        // Arrange
        const int number = 6;
        var eventCounters = new List<EventCounter> {
            new()
            {
                Position =0,
                Checked = true,
                Result = "12345600"
            }
        };

        // Act
        var counterElement = service.GetEventCounters(eventCounters);

        // Assert
        Assert.Equal(number, counterElement.Count);
    }
}