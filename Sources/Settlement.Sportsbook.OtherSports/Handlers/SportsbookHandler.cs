using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Threading.Tasks;
using MediatR;
using System.Threading;
using Settlement.Sportsbook.OtherSports.Services;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Constants;

namespace Settlement.Sportsbook.OtherSports.Handlers
{
    public class SportsbookHandler :
        IRequestHandler<GetMatchRequest, OtherSportsMatchModel>,
        IRequestHandler<CalculateRequest, Result>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<RefundRequest, Result>,
        IRequestHandler<RefundParlayRequest, Result>,
        IRequestHandler<GetLastestResultRequest, MatchDetail>
    {
        private readonly SportsbookService sportsbookService;

        private readonly SettlementActionsService settlementActionsService;

        private readonly PermissionService permissionService;

        public SportsbookHandler(SportsbookService sportsbookService, SettlementActionsService settlementActionsService, PermissionService permissionService)
        {
            this.sportsbookService = sportsbookService;
            this.settlementActionsService = settlementActionsService;
            this.permissionService = permissionService;
        }

        public async Task<OtherSportsMatchModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
        {
            var match = await sportsbookService.GetMatch(request);
            var permission = permissionService.Permission;

            return new OtherSportsMatchModel
            {
                Match = match,
                Permission = permission
            };
        }

        public async Task<Result> Handle(CalculateRequest request, CancellationToken cancellationToken)
        {
            if (sportsbookService.IsModifyResultDetailGroup(request.SportType))
            {
                return await settlementActionsService.CalculateWithResultDetail(request);
            }

            return await settlementActionsService.Calculate(request);
        }

        public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) => await settlementActionsService.CheckMarkedTickets(request);

        public async Task<Result> Handle(RefundRequest request, CancellationToken cancellationToken) => await settlementActionsService.Refund(request);

        public async Task<Result> Handle(RefundParlayRequest request, CancellationToken cancellationToken) => await settlementActionsService.RefundParlay(request);

        public async Task<MatchDetail> Handle(GetLastestResultRequest request, CancellationToken cancellationToken) => await sportsbookService.GetLastestResult(request);
    }
}