using System.Xml.Serialization;

namespace Settlement.Setting.Models.LeagueSettings;

[XmlRoot("root")]
public class HoldMatchInfoRoot
{
    [XmlElement("r")]
    public List<HoldSettingInfo> HoldMatchInfoItems { get; set; }
}

public class HoldSettingInfo
{
    [XmlAttribute("t")]
    public short Type { get; set; }

    [XmlAttribute("s")]
    public bool Value { get; set; }

    [XmlAttribute("child")]
    public bool IsApplyChild { get; set; }
}