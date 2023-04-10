using System.Xml.Serialization;

namespace Settlement.Gaming.Models.Happy5;

[XmlRoot("Resources")]
public class Resources
{
    [XmlElement("Resource")]
    public List<ResourcesItem> ResourceItems { get; set; }
}