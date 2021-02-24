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
            IRequestHandler<GetMatchRequest, AioMatch>,
            IRequestHandler<SettleRequest, ResultCricket>,
            IRequestHandler<GetRecalResultRequest, List<MatchResultDetail>>,
            IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
            IRequestHandler<CheckMarkedTicketsParlayRequest, MarkedTickets>,
            IRequestHandler<RefundParlayRequest, Result>,
            IRequestHandler<SettleChildMatchRequest, Result>
    {
        private readonly ICricketService cricketService;

        public CricketHandler(ICricketService cricketService)
        {
            this.cricketService = cricketService;
        }

        public async Task<AioMatch> Handle(GetMatchRequest request, CancellationToken cancellationToken) => await cricketService.GetMatch(request);

        public async Task<ResultCricket> Handle(SettleRequest request, CancellationToken cancellationToken) => await cricketService.Settle(request);

        public async Task<List<MatchResultDetail>> Handle(GetRecalResultRequest request, CancellationToken cancellationToken) => await cricketService.GetRecalResult(request);

        public async Task<MarkedTickets> Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) => await cricketService.CheckMarkedTickets(request);

        public async Task<MarkedTickets> Handle(CheckMarkedTicketsParlayRequest request, CancellationToken cancellationToken) => await cricketService.CheckMarkedTicketsParlay(request);

        public async Task<Result> Handle(RefundParlayRequest request, CancellationToken cancellationToken) => await cricketService.RefundParlay(request);

        public async Task<Result> Handle(SettleChildMatchRequest request, CancellationToken cancellationToken) => await cricketService.SettleChildMatch(request);

    }
}
