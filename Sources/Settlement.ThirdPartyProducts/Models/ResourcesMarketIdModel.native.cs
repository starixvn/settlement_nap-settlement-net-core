using System.Xml.Serialization;

namespace Settlement.ThirdPartyProducts.Models;

[XmlRoot("Resources")]
public class ResourcesMarketIdModel
{
    [XmlElement("rsc")]
    public List<ResourceMarketItemModel> Items { get; set; }
}