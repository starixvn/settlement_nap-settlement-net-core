using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;
using System.Collections.Generic;

namespace Settlement.FastMarkets.Services
{
    public interface IEventCounterResultService
    {
        EventCounterElement GoalResult(List<EventCounter> eventCounters);

        EventCounterElement CornerResult(List<EventCounter> eventCounters);

        EventCounterElement FreeKickResult(List<EventCounter> eventCounters);

        EventCounterElement GoalKickResult(List<EventCounter> eventCounters);

        EventCounterElement ThrowInResult(List<EventCounter> eventCounters);

        EventCounterElement PenaltyResult(List<EventCounter> eventCounters);
    }

    public class EventCounterResultServiceImp : IEventCounterResultService
    {
        public EventCounterElement GoalResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.Goal
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.Goal,
                Items = items
            };
        }

        public EventCounterElement CornerResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.Corner
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.Corner,
                Items = items
            };
        }

        public EventCounterElement FreeKickResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.FreeKick
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.FreeKick,
                Items = items
            };
        }

        public EventCounterElement GoalKickResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.GoalKick
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.GoalKick,
                Items = items
            };
        }

        public EventCounterElement ThrowInResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.ThrowIn
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.ThrowIn,
                Items = items
            };
        }

        public EventCounterElement PenaltyResult(List<EventCounter> eventCounters)
        {
            var items = new List<ItemElement>();
            foreach (var eventCounter in eventCounters)
            {
                var item = new ItemElement
                {
                    Position = eventCounter.Position,
                    Result = eventCounter.EventResultItem.Penalty
                };

                items.Add(item);
            }

            return new EventCounterElement
            {
                Id = EventCounterResource.Penalty,
                Items = items
            };
        }
    }
}