using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class LeagueHandler : IRequestHandler<LeaguesRequest, List<LeagueTypeModel>>
    {
        private readonly BetBuilderService betBuilderService;

        public LeagueHandler(BetBuilderService betBuilderService)
        {
            this.betBuilderService = betBuilderService;
        }

        public async Task<List<LeagueTypeModel>> Handle(LeaguesRequest request, CancellationToken cancellationToken) => await betBuilderService.GetLeagues(request);
    }
}