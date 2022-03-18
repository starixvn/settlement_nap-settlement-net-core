using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.EventCounterModels
{
    [XmlRoot("EventCounters")]
    public class EventCountersRoot
    {
        [XmlElement("EventCounter")]
        public List<EventCounterElement> EventCounter { get; set; }
    }
}