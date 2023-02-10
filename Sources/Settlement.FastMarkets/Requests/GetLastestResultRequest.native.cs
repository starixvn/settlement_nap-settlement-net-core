using MediatR;
using Settlement.FastMarkets.Models;
using System.Collections.Generic;

namespace Settlement.FastMarkets.Requests;

public class GetLastestResultRequest : IRequest<List<FastMarketResult>>
{
    public int MatchId { get; set; }
}