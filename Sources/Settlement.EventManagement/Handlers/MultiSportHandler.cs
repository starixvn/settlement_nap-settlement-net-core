using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.Handlers
{
    public class MultiSportHandler : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<RefreshMatchesRequest, IList<MultiSportMatchWaiting>>,
        IRequestHandler<CalculateParlayRequest, Result>
    {
        private readonly IMultiSportService multiSportService;
        private readonly PermissionService permissionService;
        private readonly INapSession currentSession;
        private readonly IMapper mapper;

        public MultiSportHandler(
            IMultiSportService multiSportService,
            PermissionService permissionService,
            IMapper mapper,
            INapSession currentSession)
        {
            this.multiSportService = multiSportService;
            this.permissionService = permissionService;
            this.mapper = mapper;
            this.currentSession = currentSession;
        }

        public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
        {
            return new MultiSportModel
            {
                Sports = await multiSportService.GetSportBook(request),
                Permission = permissionService.Permission
            };
        }

        public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await multiSportService.GetLeagues(request);

        public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await multiSportService.GetSports(request);

        public async Task<IList<MultiSportMatchWaiting>> Handle(RefreshMatchesRequest request, CancellationToken cancellationToken)
        {
            var list = await multiSportService.GetWaitingMatches(request);
            return mapper.Map<IList<Models.Match>, IList<MultiSportMatchWaiting>>(list);
        }

        public async Task<Result> Handle(CalculateParlayRequest request, CancellationToken cancellationToken)
        {
            request.AdminId = currentSession.UserId;
            return await multiSportService.Calculate(request);
        }
    }
}