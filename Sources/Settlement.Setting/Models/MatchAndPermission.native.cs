using System.Xml.Serialization;
using Settlement.Core.Models;

namespace Settlement.Setting.Models;

public class MatchAndPermission
{
    public Permission Permission { get; set; }

    public RemarkQueryModel Match { get; set; }
}

[XmlRoot("root")]
public class HoldMatchInfoRoot
{
    [XmlElement("r")]
    public List<HoldMatchInfoItem> HoldMatchInfoItems { get; set; }
}

public class HoldMatchInfoItem
{
    [XmlAttribute("t")]
    public int Type { get; set; }

    [XmlAttribute("s")]
    public bool Value { get; set; }

    [XmlAttribute("child")]
    public bool IsApplyChild { get; set; }
}