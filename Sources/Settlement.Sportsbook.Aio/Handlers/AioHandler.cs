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
    public class AioHandler :
            IRequestHandler<GetMatchRequest, AioMatch>,
            IRequestHandler<SettleRequest, Result>,
            IRequestHandler<GetRecalResultRequest, List<MatchResultDetail>>,
            IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
            IRequestHandler<RefundParlayRequest, Result>,
            IRequestHandler<CheckRunningOddsRequest, Result>,
            IRequestHandler<SaveScoreRequest, Result>
    {
        private readonly IAioService aioService;

        public AioHandler(IAioService aioService)
        {
            this.aioService = aioService;
        }

        public async Task<AioMatch> Handle(GetMatchRequest request, CancellationToken cancellationToken) => await aioService.GetMatch(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) => await aioService.Settle(request);

        public async Task<List<MatchResultDetail>> Handle(GetRecalResultRequest request, CancellationToken cancellationToken) => await aioService.GetRecalResult(request);

        public async Task<MarkedTickets> Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) => await aioService.CheckMarkedTickets(request);

        public async Task<Result> Handle(RefundParlayRequest request, CancellationToken cancellationToken) => await aioService.RefundParlay(request);

        public async Task<Result> Handle(CheckRunningOddsRequest request, CancellationToken cancellationToken) => await aioService.VerifyNoRunningOdds(request);

        public async Task<Result> Handle(SaveScoreRequest request, CancellationToken cancellationToken) => await aioService.SaveScore(request);
    }
}