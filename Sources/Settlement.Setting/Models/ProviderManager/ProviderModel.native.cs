using System.Xml.Serialization;

namespace Settlement.Setting.Models;

public class ProviderModel
{
    [XmlAttribute("SourceId")]
    public int SourceId { get; set; }

    [XmlIgnore]
    public string SourceName { get; set; }

    [XmlIgnore]
    public string Remark { get; set; }

    [XmlAttribute("OrderNo")]
    public int OrderNo { get; set; }
}