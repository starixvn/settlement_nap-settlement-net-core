using Kaden.XmlConverter;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services
{
    public interface IEventCounterService
    {
        string Result(SettleRequest request);
    }

    public class EventCounterServiceImp : IEventCounterService
    {
        private const string Calculate = "CAL";

        private readonly IEventCounterElementService eventCounterElementService;

        private readonly XmlConvertService xmlConvertService;

        public EventCounterServiceImp(IEventCounterElementService eventCounterElementService,
            XmlConvertService xmlConvertService)
        {
            this.eventCounterElementService = eventCounterElementService;
            this.xmlConvertService = xmlConvertService;
        }

        public string Result(SettleRequest request)
        {
            if (request.Action.Equals(Calculate) || request.IsSettleDetermined)
            {
                var eventCounter = eventCounterElementService.GetEventCounters(request.EventCounters);

                var eventCountersRoot = new EventCountersRoot
                {
                    EventCounter = eventCounter
                };

                return xmlConvertService.Serialize(eventCountersRoot);
            }
            else
            {
                return string.Empty;
            }
        }
    }
}