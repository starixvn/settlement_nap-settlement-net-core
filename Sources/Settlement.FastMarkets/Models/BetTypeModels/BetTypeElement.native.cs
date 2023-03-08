using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.BetTypeModels;

public class BetTypeElement
{
    [XmlAttribute]
    public int Id { get; set; }

    [XmlElement("Item")]
    public List<ItemElement> Items { get; set; }
}