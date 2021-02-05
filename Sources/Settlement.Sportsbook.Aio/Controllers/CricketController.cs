using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.Aio.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowOrigin")]
    [Authorize]
    public class CricketController : ControllerBase
    {
        private readonly IMediator mediator;

        public CricketController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-marked-tickets")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> CheckMarkedTickets(CheckMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-recal-result")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> GetRecalResult(GetRecalResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-marked-tickets-parlay")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund-parlay")]
        [HttpPost]
        [LoggingFilterApi]
        public async Task<IActionResult> RefundParlay(RefundParlayRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}