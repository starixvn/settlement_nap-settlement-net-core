using Settlement.Core.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services;

public interface IEventCounterService
{
    XMLResult<EventCounterElement> Result(SettleRequest request);
}

public class EventCounterServiceImp(
    IEventCounterElementService eventCounterElementService,
    XmlConvertService xmlConvertService)
    : IEventCounterService
{
    public XMLResult<EventCounterElement> Result(SettleRequest request)
    {
        if (request.Action.Equals(ActionType.CalculateAll) || request.IsSettleDetermined)
        {
            var eventCounter = eventCounterElementService.GetEventCounters(request.EventCounters);
            var eventCountersRoot = new EventCountersRoot
            {
                EventCounter = eventCounter
            };

            return new XMLResult<EventCounterElement>
            {
                OriginalItems = [],
                Result = xmlConvertService.Serialize(eventCountersRoot)
            };
        }

        return new XMLResult<EventCounterElement>
        {
            OriginalItems = [],
            Result = string.Empty
        };
    }
}