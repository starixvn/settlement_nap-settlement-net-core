using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
using System.Xml.Serialization;

namespace Settlement.Log.Models.LogElement;

[XmlRoot("logs")]
public class LogRoot
{
    [XmlElement("distinct")]
    public List<DistinctElement> DistinctLogs { get; set; }

    [XmlElement("root")]
    public List<RootElement> RootLogs { get; set; }

    [XmlElement("bettypes")]
    public List<BetTypesRoot> BetTypeRoot { get; set; }

    [XmlElement("eventcounter")]
    public List<EventCountersRoot> EventCounterRoot { get; set; }
}