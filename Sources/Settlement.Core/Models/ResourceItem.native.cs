using System.Xml.Serialization;

namespace Settlement.Core.Models;

public class ResourceItem : BaseResourceItem
{
    private string determined = "0";

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
        get => IsSettleDetermined ? "1" : determined;
        set => determined = value;
    }

    [XmlIgnore]
    public bool IsSettleDetermined { get; set; }

    [XmlIgnore]
    public int? AwayId { get; set; }

    [XmlIgnore]
    public int? HomeId { get; set; }
}