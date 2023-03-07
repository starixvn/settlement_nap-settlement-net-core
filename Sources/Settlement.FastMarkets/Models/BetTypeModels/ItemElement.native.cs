using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.BetTypeModels;

public class ItemElement
{
    [XmlAttribute]
    public int Position { get; set; }

    [XmlAttribute]
    public string Result { get; set; }
}