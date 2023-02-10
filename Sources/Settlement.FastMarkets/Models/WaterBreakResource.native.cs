using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models;

[XmlRoot("r")]
public class WaterBreakResource<T>
{
    [XmlElement("w")]
    public T Item { get; set; }
}