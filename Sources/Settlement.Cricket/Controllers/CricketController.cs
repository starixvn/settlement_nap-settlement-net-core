using MediatR;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Settlement.Sportsbook.Aio.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowOrigin")]
    public class CricketController : ControllerBase
    {
        private readonly IMediator mediator;

        public CricketController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match")]
        [HttpPost]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle")]
        [HttpPost]
        public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}