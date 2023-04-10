using System.Xml.Serialization;

namespace Settlement.Sportsbook.Soccer.Models;

[XmlRoot("Results")]
public class XmlResults
{
    [XmlElement("Resource")]
    public List<XmlResource> Resources { get; set; }
}