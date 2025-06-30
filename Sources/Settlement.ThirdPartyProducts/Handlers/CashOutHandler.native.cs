using Fanex.Settlement.MessageBridge.JackTime;
using MediatR;
using Settlement.ThirdPartyProducts.Constants;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Requests.CashOut;
using Settlement.ThirdPartyProducts.Services;
using VoidBetRequest = Settlement.ThirdPartyProducts.Requests.CashOut.VoidBetRequest;

namespace Settlement.ThirdPartyProducts.Handlers;

public class CashOutHandler(IVoidBetApiService voidBetApiService) :
    IRequestHandler<VoidBetRequest>,
    IRequestHandler<CalcRequest>,
    IRequestHandler<RefundRequest>,
    IRequestHandler<GetTicketInfo, List<VoidBetInfo>>
{
    public async Task<List<VoidBetInfo>> Handle(GetTicketInfo request, CancellationToken cancellationToken) =>
        await voidBetApiService.GetTicketInfo(request);

    public async Task Handle(VoidBetRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.VoidBet(request);
    }

    public async Task Handle(CalcRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.PostResult(CashOutAction.Update, request);
    }

    public async Task Handle(RefundRequest request, CancellationToken cancellationToken)
    {
        await voidBetApiService.PostResult(CashOutAction.Refund, request);
    }
}