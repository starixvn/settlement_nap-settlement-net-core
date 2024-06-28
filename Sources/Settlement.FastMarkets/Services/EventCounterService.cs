using Settlement.Constants;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services;

public interface IEventCounterService
{
    string Result(SettleRequest request);
}

public class EventCounterServiceImp(
    IEventCounterElementService eventCounterElementService,
    XmlConvertService xmlConvertService)
    : IEventCounterService
{
    public string Result(SettleRequest request)
    {
        if (request.Action.Equals(ActionType.CalculateAll) || request.IsSettleDetermined)
        {
            var eventCounter = eventCounterElementService.GetEventCounters(request.EventCounters);

            var eventCountersRoot = new EventCountersRoot
            {
                EventCounter = eventCounter
            };

            return xmlConvertService.Serialize(eventCountersRoot);
        }

        return string.Empty;
    }
}