using System.Xml.Serialization;

namespace Settlement.Setting.Models.OutsideSourceManager;

[XmlRoot("PGIds")]
public class OutsideSourceResources<T>
{
    [XmlElement("PGId")]
    public List<T> Items { get; set; }
}