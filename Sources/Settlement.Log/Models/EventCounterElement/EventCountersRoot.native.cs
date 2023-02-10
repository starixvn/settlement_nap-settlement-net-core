using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Log.Models.EventCounterElement;

[XmlRoot("EventCounters")]
public class EventCountersRoot
{
    [XmlElement("Item")]
    public List<ItemElement> Items { get; set; }
}