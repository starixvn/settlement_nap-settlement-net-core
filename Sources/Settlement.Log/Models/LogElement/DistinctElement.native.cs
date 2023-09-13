using System.Xml.Serialization;

namespace Settlement.Log.Models.LogElement;

[XmlRoot("distinct")]
public class DistinctElement
{
    [XmlElement("r")]
    public LogItem[] Logs { get; set; }
}