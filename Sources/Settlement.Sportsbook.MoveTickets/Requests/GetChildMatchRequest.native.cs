using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class GetChildMatchRequest : IRequest<List<ChildMatch>>
{
    public string MatchIds { get; set; }

    public string Mode { get; set; }
}