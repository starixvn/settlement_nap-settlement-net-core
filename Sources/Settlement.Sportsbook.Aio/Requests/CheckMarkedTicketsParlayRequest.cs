using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class CheckMarkedTicketsParlayRequest : IRequest<MarkedTickets>
    {
        public int MatchId { get; set; }
    }
}