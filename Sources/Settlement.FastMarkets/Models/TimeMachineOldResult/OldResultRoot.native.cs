using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.TimeMachineOldResult;

[XmlRoot("r")]
public class OldResultRoot
{
    [XmlElement("b")]
    public List<OldResultElement> OldResultElements { get; set; }
}