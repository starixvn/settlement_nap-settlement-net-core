using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.ThirdPartyProducts.Requests;

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
        [LogRequestResponse]
        public async Task<IActionResult> VoidBet(VoidBetRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}