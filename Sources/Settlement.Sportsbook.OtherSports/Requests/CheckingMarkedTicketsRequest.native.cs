using MediatR;
using Settlement.Models;

namespace Settlement.Sportsbook.OtherSports.Requests;

public class CheckingMarkedTicketsRequest : IRequest<MarkedTickets>
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }
}