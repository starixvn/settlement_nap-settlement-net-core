using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.EventCounterModels
{
    public class EventCounterElement
    {
        [XmlAttribute]
        public string Id { get; set; }

        [XmlElement("Item")]
        public List<ItemElement> Items { get; set; }
    }
}