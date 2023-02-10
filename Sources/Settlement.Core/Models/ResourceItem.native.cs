using System.Xml.Serialization;

namespace Settlement.Core.Models;

public class ResourceItem
{
    public ResourceItem()
    {
    }

    public ResourceItem(string id)
    {
        ResourceId = id;
    }

    [XmlAttribute("Id")]
    public string ResourceId { get; set; }

    [XmlAttribute("Home")]
    public string HomeValue { get; set; }

    [XmlAttribute("Away")]
    public string AwayValue { get; set; }

    [XmlAttribute("OtherInfo")]
    public string OtherInfo { get; set; }

    [XmlAttribute("IsDetermined")]
    public string Determined
    {
        get
        {
            return IsSettleDetermined ? "1" : "0";
        }

        set { }
    }

    [XmlIgnore]
    public bool IsSettleDetermined { get; set; }
}