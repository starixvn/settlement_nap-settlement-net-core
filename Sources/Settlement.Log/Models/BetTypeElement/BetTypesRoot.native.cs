using System.Xml.Serialization;

namespace Settlement.Log.Models.BetTypeElement;

[XmlRoot("bettypes")]
public class BetTypesRoot
{
    [XmlElement("bettype")]
    public BetTypeElement[] BetTypes { get; set; }
}

[XmlRoot("BetTypes")]
public class BetTypesRootOldStyle
{
    [XmlElement("BetType")]
    public BetTypeElement[] BetTypes { get; set; }
}