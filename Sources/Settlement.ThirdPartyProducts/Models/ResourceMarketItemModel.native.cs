using System.Xml.Serialization;

namespace Settlement.ThirdPartyProducts.Models;

public class ResourceMarketItemModel
{
    [XmlAttribute("m")]
    public string MarketId { get; set; }
}