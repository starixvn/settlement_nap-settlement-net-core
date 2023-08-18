using System.Xml.Serialization;

namespace Settlement.Log.Models.LogElement;

[XmlRoot("logs")]
public class LogRoot
{
    [XmlElement("distinct")]
    public DistinctElement DistinctLogs { get; set; }

    [XmlElement("root")]
    public List<RootElement> RootLogs { get; set; }
}