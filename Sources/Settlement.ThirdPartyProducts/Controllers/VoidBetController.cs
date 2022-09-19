using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.ThirdPartyProducts.Requests;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Controllers
{
    [ApiController]
    [Route("api/void-bet")]
    [SessionAuthorize]
    public class VoidBetController : ControllerBase
    {
        private readonly IMediator mediator;

        public VoidBetController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("update")]
        [HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> VoidBet(VoidBetRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-ticket")]
        [HttpPost]
        [LogGetRequest]
        public async Task<IActionResult> GetTicket(GetTicketInfo request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}