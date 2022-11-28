using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class CheckMarkedTicketsRequest : IRequest<MarkedTickets>
{
    public int MatchId { get; set; }

    public List<ResourceItem> SelectedResources { get; set; }

    public bool IsMergedParlay { get; set; }
}