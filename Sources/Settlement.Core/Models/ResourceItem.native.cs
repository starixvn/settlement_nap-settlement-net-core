using System.Xml.Serialization;

namespace Settlement.Core.Models;

public class ResourceItem : BaseResourceItem
{
    public ResourceItem()
    {
    }

    public ResourceItem(string id)
    {
        ResourceId = id;
    }

    [XmlAttribute("OtherInfo")]
    public string OtherInfo { get; set; }

    [XmlAttribute("IsDetermined")]
    public string Determined
    {
        get => IsSettleDetermined ? "1" : "0";

        set { }
    }

    [XmlIgnore]
    public bool IsSettleDetermined { get; set; }
}