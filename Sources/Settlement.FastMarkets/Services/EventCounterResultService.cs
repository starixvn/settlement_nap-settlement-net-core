using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;

namespace Settlement.FastMarkets.Services;

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
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.Goal }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.Goal,
            Items = items
        };
    }

    public EventCounterElement CornerResult(List<EventCounter> eventCounters)
    {
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.Corner }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.Corner,
            Items = items
        };
    }

    public EventCounterElement FreeKickResult(List<EventCounter> eventCounters)
    {
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.FreeKick }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.FreeKick,
            Items = items
        };
    }

    public EventCounterElement GoalKickResult(List<EventCounter> eventCounters)
    {
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.GoalKick }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.GoalKick,
            Items = items
        };
    }

    public EventCounterElement ThrowInResult(List<EventCounter> eventCounters)
    {
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.ThrowIn }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.ThrowIn,
            Items = items
        };
    }

    public EventCounterElement PenaltyResult(List<EventCounter> eventCounters)
    {
        var items = eventCounters.Select(eventCounter => new ItemElement { Position = eventCounter.Position, Result = eventCounter.EventResultItem.Penalty }).ToList();

        return new EventCounterElement
        {
            Id = EventCounterResource.Penalty,
            Items = items
        };
    }
}