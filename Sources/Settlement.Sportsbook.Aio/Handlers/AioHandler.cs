using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Handlers
{
    public class AioHandler :
        IRequestHandler<GetMatchRequest, AioMatch>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<GetRecalResultRequest, List<Models.ResultDetail>>,
        IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<CheckRunningOddsRequest, Result>,
        IRequestHandler<SaveScoreRequest, Result>,
        IRequestHandler<SettleChildMatchRequest, Result>,
        IRequestHandler<ResultSettingRequest, Boolean>,
        IRequestHandler<VoidBetRequest>

    {
        private readonly IAioService aioService;

        private readonly IVoidBetApiService voidBetApiService;

        public AioHandler(
            IAioService aioService,
            IVoidBetApiService voidBetApiService)
        {
            this.aioService = aioService;
            this.voidBetApiService = voidBetApiService;
        }

        public async Task<AioMatch> Handle(GetMatchRequest request, CancellationToken cancellationToken) =>
            await aioService.GetMatch(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) =>
            await aioService.Settle(request);

        public async Task<List<Models.ResultDetail>> Handle(GetRecalResultRequest request,
            CancellationToken cancellationToken) => await aioService.GetRecalResult(request);

        public async Task<MarkedTickets>
            Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) =>
            await aioService.CheckMarkedTickets(request);

        public async Task<Result> Handle(CheckRunningOddsRequest request, CancellationToken cancellationToken) =>
            await aioService.VerifyNoRunningOdds(request);

        public async Task<Result> Handle(SaveScoreRequest request, CancellationToken cancellationToken) =>
            await aioService.SaveScore(request);

        public async Task<Result> Handle(SettleChildMatchRequest request, CancellationToken cancellationToken) =>
            await aioService.SettleChildMatch(request);

        public async Task<bool> Handle(ResultSettingRequest request, CancellationToken cancellationToken) =>
            await aioService.ResultSetting(request);

        public async Task<Unit> Handle(VoidBetRequest request, CancellationToken cancellationToken)
        {
            await voidBetApiService.VoidBet(request);
            return Unit.Value;
        }
    }
}