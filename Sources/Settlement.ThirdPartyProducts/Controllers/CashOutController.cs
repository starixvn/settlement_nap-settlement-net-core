using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Requests.CashOut;
using VoidBetRequest = Settlement.ThirdPartyProducts.Requests.CashOut.VoidBetRequest;

namespace Settlement.ThirdPartyProducts.Controllers;

[ApiController]
[Route("api/cash-out")]
public class CashOutController(IMediator mediator) : ControllerBase
{
    [Route("void-bet")]
    [HttpPost]
    [LogPushRequest]
    public async Task VoidBet(VoidBetRequest request) => await mediator.Send(request).ConfigureAwait(false);

    [Route("get-ticket")]
    [HttpPost]
    public async Task<IActionResult> GetTicket(GetTicketInfo request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("calc")]
    [HttpPost]
    [LogPushRequest]
    public async Task Calc(CalcRequest request) => await mediator.Send(request).ConfigureAwait(false);

    [Route("refund")]
    [HttpPost]
    [LogPushRequest]
    public async Task Refund(RefundRequest request) => await mediator.Send(request).ConfigureAwait(false);
}