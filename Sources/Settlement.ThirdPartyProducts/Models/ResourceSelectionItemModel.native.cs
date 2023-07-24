using System.Xml.Serialization;

namespace Settlement.ThirdPartyProducts.Models;

public class ResourceSelectionItemModel
{
    private int status;

    [XmlAttribute("Id")]
    public int MarketId { get; set; }

    [XmlIgnore]
    public bool IsRunning { get; set; }

    [XmlAttribute("s")]
    public int Status
    {
        get => IsRunning ? 1 : status;
        set => status = value;
    }

    public override bool Equals(object obj)
    {
        return obj is ResourceSelectionItemModel item && item.MarketId == MarketId;
    }

    public override int GetHashCode()
    {
        return MarketId;
    }
}