using System.Xml.Serialization;

namespace Settlement.Setting.Models.OutsideSourceManager;

public class OutsideSourceResourceItem
{
    [XmlAttribute("PGId")]
    public int PGid { get; set; }

    [XmlIgnore]
    public string SourceName { get; set; }

    [XmlIgnore]
    public string Remark { get; set; }

    [XmlAttribute("OrderNo")]
    public int OrderNo { get; set; }
}