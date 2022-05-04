using MediatR;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Settlement.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class CalculateHandler : IRequestHandler<CalculateRequest, Result>
    {
        private readonly BetBuilderService betBuilderServices;

        public CalculateHandler(BetBuilderService betBuilderServices)
        {
            this.betBuilderServices = betBuilderServices;
        }

        public async Task<Result> Handle(CalculateRequest request, CancellationToken cancellationToken) => await betBuilderServices.Calculate(request);
    }
}