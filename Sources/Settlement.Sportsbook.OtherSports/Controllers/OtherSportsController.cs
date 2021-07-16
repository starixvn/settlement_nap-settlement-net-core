using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.OtherSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OtherSportsController : ControllerBase
    {
        private readonly IMediator mediator;

        public OtherSportsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match"), HttpPost]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("calculate"), HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> Calculate(CalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund"), HttpPost]
        public async Task<IActionResult> Refund(RefundRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund-parlay"), HttpPost]
        public async Task<IActionResult> RefundParlay(RefundParlayRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-marked-tickets"), HttpPost]
        public async Task<IActionResult> CheckMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-lastest-result"), HttpPost]
        public async Task<IActionResult> GetLastestResult(GetLastestResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}