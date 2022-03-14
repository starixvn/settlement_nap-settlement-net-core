using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.Handlers
{
    public class MultiSportHandler : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<SportTypeModel>>
    {
        private readonly IMultiSportService multiSportService;
        private readonly PermissionService permissionService;

        public MultiSportHandler(IMultiSportService multiSportService, PermissionService permissionService)
        {
            this.multiSportService = multiSportService;
            this.permissionService = permissionService;
        }

        public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
        {
            return new MultiSportModel
            {
                Sports = await multiSportService.GetSportBook(request),
                Permission = permissionService.Permission
            };
        }

        public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken)
        {
            return await multiSportService.GetLeagues(request);
        }

        public async Task<List<SportTypeModel>> Handle(SportRequest request, CancellationToken cancellationToken)
        {
            return await multiSportService.GetSports(request);
        }
    }
}