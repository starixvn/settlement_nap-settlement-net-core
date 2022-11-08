using MediatR;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services.Calculation;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Handlers
{
    public class CalculationHandler :
        IRequestHandler<FilterCalculationRequest, CalculationLeagues>,
        IRequestHandler<LeagueCalculationRequest, List<LeagueTypeModel>>,
        IRequestHandler<RefreshCalculationRequest, List<Match>>,
        IRequestHandler<FilterAutoCalculationRequest, CalculationLeagues>
    {
        private readonly LeagueService leagueService;

        private readonly MatchService matchService;

        private readonly PermissionService permissionService;

        public CalculationHandler(PermissionService permissionService,
            LeagueService leagueService,
            MatchService matchService)
        {
            this.permissionService = permissionService;
            this.leagueService = leagueService;
            this.matchService = matchService;
        }

        public async Task<CalculationLeagues> Handle(FilterCalculationRequest request, CancellationToken cancellationToken)
        {
            var matches = await matchService.GetMatches(request);

            return new CalculationLeagues
            {
                Leagues = leagueService.Leagues(matches),
                Permission = permissionService.Permission
            };
        }

        public async Task<List<LeagueTypeModel>> Handle(LeagueCalculationRequest request, CancellationToken cancellationToken) => await leagueService.Leagues(request);

        public async Task<List<Match>> Handle(RefreshCalculationRequest request, CancellationToken cancellationToken) => await matchService.GetWaitingMatches(request);

        public async Task<CalculationLeagues> Handle(FilterAutoCalculationRequest request, CancellationToken cancellationToken)
        {
            var matches = await matchService.GetMatchesAutoCalculate(request);
            return new CalculationLeagues
            {
                Leagues = leagueService.Leagues(matches),
                Permission = permissionService.Permission
            };
        }
    }
}