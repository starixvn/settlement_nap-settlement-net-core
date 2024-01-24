using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests;

public class GetLatestResultRequest : IRequest<List<FastMarketResult>>
{
    public int MatchId { get; set; }
}