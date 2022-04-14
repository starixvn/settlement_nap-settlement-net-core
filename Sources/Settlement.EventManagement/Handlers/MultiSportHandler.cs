using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.Handlers
{
    public class MultiSportHandler : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<SportTypeModel>>,
        IRequestHandler<RefreshMatchesRequest, IList<MultiSportMatchWaiting>>
    {
        private readonly IMultiSportService multiSportService;
        private readonly PermissionService permissionService;
        private readonly IMapper mapper;

        public MultiSportHandler(IMultiSportService multiSportService, PermissionService permissionService, IMapper mapper)
        {
            this.multiSportService = multiSportService;
            this.permissionService = permissionService;
            this.mapper = mapper;
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

        public async Task<IList<MultiSportMatchWaiting>> Handle(RefreshMatchesRequest request,
            CancellationToken cancellationToken)
        {
            var list = await multiSportService.GetWaitingMatches(request);
            return mapper.Map<IList<Match>, IList<MultiSportMatchWaiting>>(list);
        }
    }
}