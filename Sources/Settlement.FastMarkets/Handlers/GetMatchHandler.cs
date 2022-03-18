using System.Collections.Generic;
using MediatR;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using System.Threading;
using System.Threading.Tasks;
using Settlement.Core.Services;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.Handlers
{
    public class GetMatchHandler : IRequestHandler<MatchDetailRequest, MatchDetail>,
        IRequestHandler<BetTypeIntervalRequest, FastMarketModel>,
        IRequestHandler<GetLastestResultRequest, List<FastMarketResult>>,
        IRequestHandler<GetTimeMachineResultRequest, List<TimeMachineResult>>
    {
        private readonly IMatchDetailService matchDetailService;

        private readonly PermissionService permissionService;

        private readonly IFastMarketService fastMarketService;

        public GetMatchHandler(IMatchDetailService matchDetailService, PermissionService permissionService, IFastMarketService fastMarketService)
        {
            this.matchDetailService = matchDetailService;
            this.permissionService = permissionService;
            this.fastMarketService = fastMarketService;
        }

        public async Task<MatchDetail> Handle(MatchDetailRequest request, CancellationToken cancellationToken)
        {
            var matchDetail = await matchDetailService.MatchInfo(request.MatchId);
            matchDetail.AutoSettingIcon.Disabled = !permissionService.Permission.AutoSettlement;
            return matchDetail;
        }

        public async Task<FastMarketModel> Handle(BetTypeIntervalRequest request, CancellationToken cancellationToken)
        {
            var fastMarketModel = await fastMarketService.Query(request.MatchId);
            fastMarketModel.Permission = permissionService.Permission;
            return fastMarketModel;
        }

        public async Task<List<FastMarketResult>> Handle(GetLastestResultRequest request, CancellationToken cancellationToken) => await fastMarketService.GetLastestResult(request);

        public async Task<List<TimeMachineResult>> Handle(GetTimeMachineResultRequest request, CancellationToken cancellationToken) => await fastMarketService.GetTimeMachineResult(request);
    }
}