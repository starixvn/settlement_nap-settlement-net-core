using System.Xml.Serialization;

namespace Settlement.Log.Models.LogElement;

[XmlRoot("root")]
public class RootElement
{
    [XmlElement("r")]
    public LogItem[] Logs { get; set; }
}