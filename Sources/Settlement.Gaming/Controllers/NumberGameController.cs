using MediatR;
using Settlement.Gaming.Requests;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;

namespace Settlement.Gaming.Controllers
{
    [ApiController]
    [Route("api/number-game")]
    [SessionAuthorize]
    public class NumberGameController : ControllerBase
    {
        private readonly IMediator mediator;

        public NumberGameController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("filter-default"), HttpGet]
        public async Task<IActionResult> Filter() => Ok
        (
            await Task.Run(() => new NumberGameMatchRequest()).ConfigureAwait(false)
        );

        [Route("search"), HttpPost]
        public async Task<IActionResult> Search(NumberGameMatchRequest request) => Ok
        (
            await mediator.Send(request).ConfigureAwait(false)
        );

        [Route("get-ball"), HttpGet]
        public async Task<IActionResult> GetBallsByMatch(int matchId)
        {
            var request = new NumberGameBallsRequest
            {
                MatchId = matchId
            };

            return Ok(await mediator.Send(request).ConfigureAwait(false));
        }

        [Route("settle"), HttpPost]
        public async Task<IActionResult> Settle(NumberGameSettlementRequest request) => Ok
        (
           await mediator.Send(request).ConfigureAwait(false)
        );
    }
}