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
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.Handlers
{
    public class MatchesHandler : IRequestHandler<FilterMatchRequest, CalculationLeagues>
    {
        private readonly IMultiSportService multiSportService;
        private readonly PermissionService permissionService;
        private readonly INapSession currentSession;
        private readonly IMapper mapper;

        public MatchesHandler(PermissionService permissionService,
            IMapper mapper,
            INapSession currentSession)
        {
            this.multiSportService = multiSportService;
            this.permissionService = permissionService;
            this.mapper = mapper;
            this.currentSession = currentSession;
        }

        public async Task<CalculationLeagues> Handle(FilterMatchRequest request, CancellationToken cancellationToken)
        {
            return new CalculationLeagues
            {
               // Sports = await multiSportService.GetSportBook(request),
                Permission = permissionService.Permission
            };
        }
    }
}
