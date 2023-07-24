using System.Xml.Serialization;

namespace Settlement.ThirdPartyProducts.Models;

public class ResourceItem
{
    public ResourceItem()
    {
    }

    public ResourceItem(string id)
    {
        ResourceId = id;
    }

    [XmlAttribute("Id")]
    public string ResourceId { get; set; }

    [XmlAttribute("Home")]
    public string HomeValue { get; set; }

    [XmlAttribute("Away")]
    public string AwayValue { get; set; }
}