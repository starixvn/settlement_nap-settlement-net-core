using MediatR;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests;

public class MatchDetailRequest : IRequest<MatchDetail>
{
    public int MatchId { get; set; }
}