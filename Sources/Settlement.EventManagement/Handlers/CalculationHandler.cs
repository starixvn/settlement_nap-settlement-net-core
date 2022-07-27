using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Services;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.Calculation;
using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Handlers
{
    public class CalculationHandler : 
        IRequestHandler<FilterMatchRequest, CalculationLeagues>,
        IRequestHandler<LeagueCalculationRequest, List<LeagueTypeModel>>
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

        public async Task<CalculationLeagues> Handle(FilterMatchRequest request, CancellationToken cancellationToken)
        {
            var matches = await matchService.GetMatches(request);
            return new CalculationLeagues
            {
                Leagues= leagueService.Leagues(matches),
                Permission = permissionService.Permission
            };
        }

        public async Task<List<LeagueTypeModel>> Handle(LeagueCalculationRequest request, CancellationToken cancellationToken) => await leagueService.Leagues(request);
    }
}
