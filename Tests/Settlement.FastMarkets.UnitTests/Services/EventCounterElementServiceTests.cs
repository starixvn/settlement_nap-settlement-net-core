using NSubstitute;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;
using System.Collections.Generic;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Services;

public class EventCounterElementServiceTests
{
    private readonly IEventCounterResultService eventCounterResultService;

    private readonly IEventCounterElementService service;

    public EventCounterElementServiceTests()
    {
        eventCounterResultService = Substitute.For<IEventCounterResultService>();
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
        var number = 6;
        var eventCounters = new List<EventCounter> {
            new EventCounter {
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