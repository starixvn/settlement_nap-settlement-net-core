using MediatR;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Constants;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Requests.CashOut;
using Settlement.ThirdPartyProducts.Services;

namespace Settlement.ThirdPartyProducts.Handlers;

public class CashOutHandler :
    IRequestHandler<VoidBetRequest>,
    IRequestHandler<CalcRequest>,
    IRequestHandler<RefundRequest>,
    IRequestHandler<GetTicketInfo, List<VoidBetInfo>>
{
    private readonly IVoidBetApiService voidBetApiService;

    public CashOutHandler(
        IVoidBetApiService voidBetApiService
    )
    {
        this.voidBetApiService = voidBetApiService;
    }

    public async Task Handle(VoidBetRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.VoidBetApi(request);
    }

    public async Task<List<VoidBetInfo>> Handle(GetTicketInfo request, CancellationToken cancellationToken) =>
        await voidBetApiService.GetTicketInfo(request);

    public async Task Handle(CalcRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.PostResult(CashOutAction.Update, request);
    }

    public async Task Handle(RefundRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.PostResult(CashOutAction.Refund, request);
    }
}