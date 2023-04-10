using MediatR;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Handlers;

public class VoidBetHandler : IRequestHandler<VoidBetRequest>, IRequestHandler<GetTicketInfo, List<VoidBetInfo>>
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

    public async Task<List<VoidBetInfo>> Handle(GetTicketInfo request, CancellationToken cancellationToken) =>
        await voidBetApiService.GetTicketInfo(request);
}