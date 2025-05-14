using System.Xml.Serialization;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class SettleEarlyRequest : IRequest<Result>
{
    public int MatchId { get; set; }
    public short SportType { get; set; }

    public int AdminId { get; set; }

    public string ActionName { get; set; }

    public bool IsReSettledTickets { get; set; }
    public short ChildMatchType { get; set; }

    [XmlArray("Resources")]
    [XmlArrayItem("Resource")]
    public List<ResourceItem> SelectedResources { get; set; }
}