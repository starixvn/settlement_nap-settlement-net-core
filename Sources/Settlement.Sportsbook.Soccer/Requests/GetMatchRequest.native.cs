using MediatR;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class GetMatchRequest : IRequest<Match>
{
    public int MatchId { get; set; }

    public bool IsRefundPage { get; set; }
}