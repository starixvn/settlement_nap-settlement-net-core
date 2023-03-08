using MediatR;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class GetLatestMatchDetailRequest : IRequest<MatchDetail>
{
    public int MatchId { get; set; }
}