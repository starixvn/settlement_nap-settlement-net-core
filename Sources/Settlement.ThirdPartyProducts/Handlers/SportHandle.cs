using MediatR;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Settlement.Core.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class SportHandler : IRequestHandler<SportRequest, List<Sport>>
    {
        private readonly BetBuilderService betBuilderServices;

        public SportHandler(BetBuilderService betBuilderServices)
        {
            this.betBuilderServices = betBuilderServices;
        }

        public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await betBuilderServices.GetSports(request);
    }
}