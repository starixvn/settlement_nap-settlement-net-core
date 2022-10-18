using MediatR;
using Settlement.Sportsbook.Soccer.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class GetMatchDetailThirdPartyBetTicketsRequest : IRequest<List<MatchMoveBetTicket>>
    {
        public int MatchId { get; set; }
    }
}