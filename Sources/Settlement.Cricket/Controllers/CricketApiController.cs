using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Sportsbook.Aio.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Controllers
{ 
    [ApiController]
    [Route("api/cricket")]
    public class CricketApiController : ControllerBase
    {
        private readonly IMediator mediator;

        public CricketApiController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost("get-match")]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost("settle")]
        public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}
