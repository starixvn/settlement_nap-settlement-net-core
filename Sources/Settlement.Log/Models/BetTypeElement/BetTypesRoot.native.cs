using System.Xml.Serialization;

namespace Settlement.Log.Models.BetTypeElement;

[XmlRoot("bettypes")]
public class BetTypesRoot
{
    [XmlElement("bettype")]
    public BetTypeElement[] BetTypes { get; set; }
}