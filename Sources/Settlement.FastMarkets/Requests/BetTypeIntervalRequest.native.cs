using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests;

public class BetTypeIntervalRequest : IRequest<FastMarketModel>
{
    public int MatchId { get; set; }
}