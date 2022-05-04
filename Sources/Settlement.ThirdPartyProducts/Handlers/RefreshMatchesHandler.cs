using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class RefreshMatchesHandler : IRequestHandler<MatchesWaitingRequest, List<MatchDetailModel>>
    {
        private readonly MatchService matchService;

        public RefreshMatchesHandler(MatchService matchService)
        {
            this.matchService = matchService;
        }

        public async Task<List<MatchDetailModel>> Handle(MatchesWaitingRequest request, CancellationToken cancellationToken) => await matchService.RefreshMatches(request);
    }
}