using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class CheckMarkedTicketsParlayRequest : IRequest<MarkedTickets>
    {
        public int MatchId { get; set; }
    }
}