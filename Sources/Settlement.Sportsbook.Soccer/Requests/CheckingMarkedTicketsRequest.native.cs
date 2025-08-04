using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class CheckingMarkedTicketsRequest : IRequest<MarkedTickets>
{
    public int MatchId { get; set; }

    public string ActionName { get; set; }

    public string ResourceIds { get; set; }
}