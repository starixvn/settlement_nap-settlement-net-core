using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Log.Models.BetTypeElement;

[XmlRoot("BetTypes")]
public class BetTypesRoot
{
    [XmlElement("BetType")]
    public List<BetTypeElement> BetType { get; set; }
}