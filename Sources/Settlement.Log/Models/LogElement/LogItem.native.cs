using System.Xml.Serialization;

namespace Settlement.Log.Models.LogElement;

public class LogItem
{
    [XmlAttribute("t")]
    public string Type { get; set; }

    [XmlAttribute("n")]
    public string Name { get; set; }

    [XmlAttribute("v")]
    public string Value { get; set; }
}