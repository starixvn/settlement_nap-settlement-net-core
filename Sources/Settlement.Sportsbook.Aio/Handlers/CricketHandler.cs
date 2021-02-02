using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Handlers
{
    public class CricketHandler :
            IRequestHandler<GetMatchRequest, Match>,
            IRequestHandler<SettleRequest, Result>,
            IRequestHandler<GetRecalResultRequest, List<MatchResultDetail>>,
            IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
            IRequestHandler<CheckMarkedTicketsParlayRequest, MarkedTickets>,
            IRequestHandler<RefundParlayRequest, Result>
    {
        private readonly ICricketService cricketService;

        public CricketHandler(ICricketService cricketService)
        {
            this.cricketService = cricketService;
        }

        public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken) => await cricketService.GetMatch(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) => await cricketService.Settle(request);

        public async Task<List<MatchResultDetail>> Handle(GetRecalResultRequest request, CancellationToken cancellationToken) => await cricketService.GetRecalResult(request);

        public async Task<MarkedTickets> Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) => await cricketService.CheckMarkedTickets(request);

        public async Task<MarkedTickets> Handle(CheckMarkedTicketsParlayRequest request, CancellationToken cancellationToken) => await cricketService.CheckMarkedTicketsParlay(request);

        public async Task<Result> Handle(RefundParlayRequest request, CancellationToken cancellationToken) => await cricketService.RefundParlay(request);
    }
}
