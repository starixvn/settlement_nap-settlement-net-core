using System.Collections.Generic;
using MediatR;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests
{
    public class GetLastestResultRequest : IRequest<List<FastMarketResult>>
    {
        public int MatchId { get; set; }
    }
}