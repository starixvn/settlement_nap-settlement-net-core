using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.BetTypeModels;

[XmlRoot("BetTypes")]
public class BetTypesRoot
{
    [XmlElement("BetType")]
    public List<BetTypeElement> BetType { get; set; }
}