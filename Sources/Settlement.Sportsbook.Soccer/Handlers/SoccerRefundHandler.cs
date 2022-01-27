using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    internal class SoccerRefundHandler :
        IRequestHandler<GetSpecificBetTypeRequest, List<string>>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<RefundRequest, Result>
    {
        private readonly IMatchService matchService;

        private readonly IRefundService refundService;

        public SoccerRefundHandler(IMatchService matchService, IRefundService refundService)
        {
            this.matchService = matchService;
            this.refundService = refundService;
        }

        public async Task<List<string>> Handle(GetSpecificBetTypeRequest request, CancellationToken cancellationToken) =>
            await matchService.GetSpecificBetTypes(request);

        public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) =>
            await refundService.CheckMarkedTickets(request);

        public async Task<Result> Handle(RefundRequest request, CancellationToken cancellationToken) =>
            await refundService.Refund(request);
    }
}