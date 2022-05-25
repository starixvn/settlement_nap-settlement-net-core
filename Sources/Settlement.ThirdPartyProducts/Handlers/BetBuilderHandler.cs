using MediatR;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class BetBuilderHandler : IRequestHandler<FilterRequest, MultiSportsModel>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<GetSelectionRequest, SelectionPermissionModel>,
        IRequestHandler<LeaguesRequest, List<LeagueTypeModel>>,
        IRequestHandler<MatchesWaitingRequest, List<MatchDetailModel>>,
        IRequestHandler<MatchInfoRequest, MatchDetailModel>,
        IRequestHandler<CalculateRequest, Result>
    {
        private readonly MatchService matchService;

        private readonly PermissionService permissionService;

        private readonly BetBuilderService betBuilderService;

        public BetBuilderHandler(
            MatchService matchService, 
            PermissionService permissionService,
            BetBuilderService betBuilderService)
        {
            this.matchService = matchService;
            this.permissionService = permissionService;
            this.betBuilderService = betBuilderService;
        }

        public async Task<MultiSportsModel> Handle(FilterRequest request, CancellationToken cancellationToken) => new MultiSportsModel
        {
            SportLeagues = await matchService.Search(request),
            Permission = permissionService.Permission
        };
        
        public async Task<SelectionPermissionModel> Handle(GetSelectionRequest request, CancellationToken cancellationToken) => new SelectionPermissionModel
        {
            Permission = permissionService.Permission,
            SelectionDetail = await betBuilderService.GetSelection(request.MatchId)
        };

        public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken)
            => await betBuilderService.GetSports(request);

        public async Task<List<LeagueTypeModel>> Handle(LeaguesRequest request, CancellationToken cancellationToken)
            => await betBuilderService.GetLeagues(request);

        public async Task<List<MatchDetailModel>> Handle(MatchesWaitingRequest request, CancellationToken cancellationToken)
            => await matchService.RefreshMatches(request);

        public async Task<MatchDetailModel> Handle(MatchInfoRequest request, CancellationToken cancellationToken)
            => await matchService.GetMatch(request);

        public async Task<Result> Handle(CalculateRequest request, CancellationToken cancellationToken)
            => await betBuilderService.Calculate(request);

    }
}