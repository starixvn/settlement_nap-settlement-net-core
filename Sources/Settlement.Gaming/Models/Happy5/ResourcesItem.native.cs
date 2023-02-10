using System.Xml.Serialization;

namespace Settlement.Gaming.Models.Happy5;

public class ResourcesItem
{
    [XmlAttribute("Id")]
    public byte Seq { get; set; }

    [XmlAttribute("Result")]
    public byte NumberBall { get; set; }
}