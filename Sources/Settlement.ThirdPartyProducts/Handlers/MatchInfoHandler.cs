using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class MatchInfoHandler : IRequestHandler<MatchInfoRequest, MatchDetailModel>
    {
        private readonly MatchService matchService;

        public MatchInfoHandler(MatchService matchService)
        {
            this.matchService = matchService;
        }

        public async Task<MatchDetailModel> Handle(MatchInfoRequest request, CancellationToken cancellationToken) => await matchService.GetMatch(request);
    }
}