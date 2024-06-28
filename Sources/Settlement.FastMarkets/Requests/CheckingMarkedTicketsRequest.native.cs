using Settlement.Models;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests;

public class CheckingMarkedTicketsRequest : IRequest<MarkedTickets>
{
    public int MatchId { get; set; }

    public List<BetType> BetTypes { get; set; }
}