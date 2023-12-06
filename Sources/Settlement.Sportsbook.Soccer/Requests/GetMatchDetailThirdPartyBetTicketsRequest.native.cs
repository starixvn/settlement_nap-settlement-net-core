using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class GetMatchDetailThirdPartyBetTicketsRequest : IRequest<List<MatchMoveBetTicket>>
{
    public int MatchId { get; set; }
}