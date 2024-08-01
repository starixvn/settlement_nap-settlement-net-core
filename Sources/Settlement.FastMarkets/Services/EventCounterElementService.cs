using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;

namespace Settlement.FastMarkets.Services;

public interface IEventCounterElementService
{
    List<EventCounterElement> GetEventCounters(List<EventCounter> eventCounters);
}

public class EventCounterElementServiceImp(IEventCounterResultService eventCounterResultService)
    : IEventCounterElementService
{
    public List<EventCounterElement> GetEventCounters(List<EventCounter> eventCounters)
    {
        var eventCountersElement = new List<EventCounterElement>();
        if (eventCounters.Any())
        {
            const int positionGoal = 0;
            const int positionCorner = 1;
            const int positionFreeKick = 2;
            const int positionGoalKick = 3;
            const int positionThrowIn = 4;
            const int positionPenalty = 5;

            var items = new EventCounterElement[6];
            items[positionGoal] = eventCounterResultService.GoalResult(eventCounters);
            items[positionCorner] = eventCounterResultService.CornerResult(eventCounters);
            items[positionFreeKick] = eventCounterResultService.FreeKickResult(eventCounters);
            items[positionGoalKick] = eventCounterResultService.GoalKickResult(eventCounters);
            items[positionThrowIn] = eventCounterResultService.ThrowInResult(eventCounters);
            items[positionPenalty] = eventCounterResultService.PenaltyResult(eventCounters);

            eventCountersElement.AddRange(items);
        }

        return eventCountersElement;
    }
}