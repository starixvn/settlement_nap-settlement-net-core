using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Services;
using System.Collections.Generic;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Services
{
    public class EventCounterResultServiceTests
    {
        private readonly IEventCounterResultService service;

        private readonly List<EventCounter> eventCounters;

        public EventCounterResultServiceTests()
        {
            service = new EventCounterResultServiceImp();
            eventCounters = new List<EventCounter>();
            eventCounters.Add(NewEventCounter(1, "12345678"));
            eventCounters.Add(NewEventCounter(3, "95684201"));
        }

        private EventCounter NewEventCounter(int position, string result)
        {
            return new EventCounter
            {
                Position = position,
                Result = result
            };
        }

        private ItemElement NewItemElement(int position, string result)
        {
            return new ItemElement
            {
                Position = position,
                Result = result
            };
        }

        [Fact]
        public void GoalResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "7"));
            items.Add(NewItemElement(3, "0"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.Goal,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.GoalResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }

        [Fact]
        public void CornerResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "6"));
            items.Add(NewItemElement(3, "2"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.Corner,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.CornerResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }

        [Fact]
        public void FreeKickResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "5"));
            items.Add(NewItemElement(3, "4"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.FreeKick,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.FreeKickResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }

        [Fact]
        public void GoalKickResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "4"));
            items.Add(NewItemElement(3, "8"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.GoalKick,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.GoalKickResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }

        [Fact]
        public void ThrowInResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "3"));
            items.Add(NewItemElement(3, "6"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.ThrowIn,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.ThrowInResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }

        [Fact]
        public void PenaltyResult_HasEventCounters_ReturnsRightExpectedValue()
        {
            // Arrange
            var items = new List<ItemElement>();
            items.Add(NewItemElement(1, "1"));
            items.Add(NewItemElement(3, "9"));
            var expected = new EventCounterElement
            {
                Id = EventCounterResource.Penalty,
                Items = items
            };

            // Act
            var actualEventCounterElement = service.PenaltyResult(eventCounters);

            // Assert
            AssertExtension.AreEqual(expected, actualEventCounterElement);
        }
    }
}