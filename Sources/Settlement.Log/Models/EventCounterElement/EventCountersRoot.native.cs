using System.Xml.Serialization;

namespace Settlement.Log.Models.EventCounterElement;

[XmlRoot("eventcounter")]
public class EventCountersRoot
{
    [XmlElement("Item")]
    public ItemElement[] Items { get; set; }
}

[XmlRoot("EventCounters")]
public class EventCountersRootOldStyle
{
    [XmlElement("Item")]
    public ItemElement[] Items { get; set; }
}