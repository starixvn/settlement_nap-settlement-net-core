using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class VoidBetHandler : IRequestHandler<VoidBetRequest>
    {
        private readonly IVoidBetApiService voidBetApiService;

        public VoidBetHandler(
            IVoidBetApiService voidBetApiService
        )
        {
            this.voidBetApiService = voidBetApiService;
        }

        public async Task<Unit> Handle(VoidBetRequest request, CancellationToken cancellationToken)
        {
            await voidBetApiService.VoidBetApi(request);
            return Unit.Value;
        }
    }
}