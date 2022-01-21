using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SessionAuthorize]
    public class SoccerController : ControllerBase
    {
        private readonly IMediator mediator;

        public SoccerController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match"), HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-lastest-match-detail"), HttpPost]
        public async Task<IActionResult> GetLastestMatchDetail(GetLastestMatchDetailRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("calculate"), HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> Calculate(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-status"), HttpPost]
        public async Task<IActionResult> CheckingStatus(CheckStatusRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("match-checking"), HttpPost]
        public async Task<IActionResult> MatchChecking(MatchCheckingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("undo-checking-score"), HttpPost]
        public async Task<IActionResult> UndoCheckingScore(UndoCheckingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("push-instant-score"), HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> PushInstantScore(InstantCalculationRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("specific-bet-type"), HttpPost]
        public async Task<IActionResult> LicenseeBetTypes(GetSpecificBetTypeRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("checking-marked-tickets"), HttpPost]
        public async Task<IActionResult> CheckingMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund"), HttpPost]
        public async Task<IActionResult> Refund(RefundRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}