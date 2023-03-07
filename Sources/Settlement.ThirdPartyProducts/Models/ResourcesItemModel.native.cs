using System.Xml.Serialization;

namespace Settlement.ThirdPartyProducts.Models;

public class ResourcesItemModel
{
    [XmlAttribute("Id")]
    public int SelectionType { get; set; }

    [XmlAttribute("Result")]
    public string Result { get; set; }
}