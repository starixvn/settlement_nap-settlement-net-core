using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.Handlers
{
    public class SettleHandler : IRequestHandler<SettleRequest, Result>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>
    {
        private readonly IFastMarketService fastMarketService;

        private readonly IMatchDetailService matchDetailService;

        public SettleHandler(IFastMarketService fastMarketService, IMatchDetailService matchDetailService)
        {
            this.fastMarketService = fastMarketService;
            this.matchDetailService = matchDetailService;
        }

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) => await fastMarketService.Calculate(request);

        public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) => await matchDetailService.CheckingMarkedTickets(request);
    }
}