using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.Soccer.Requests;
using System.Threading.Tasks;

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

        [Route("get-match-early"), HttpPost]
        [LogGetRequest]
        public async Task<IActionResult> GetMatchEarly(GetMatchEarlyRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle-early"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> CalculateEarly(SettleEarlyRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-match"), HttpPost]
        [LogGetRequest]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-lastest-match-detail"), HttpPost]
        public async Task<IActionResult> GetLatestMatchDetail(GetLastestMatchDetailRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("calculate"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> Calculate(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-status"), HttpPost]
        public async Task<IActionResult> CheckingStatus(CheckStatusRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("match-checking"), HttpPost]
        public async Task<IActionResult> MatchChecking(MatchCheckingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("undo-checking-score"), HttpPost]
        public async Task<IActionResult> UndoCheckingScore(UndoCheckingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("push-instant-score"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> PushInstantScore(InstantCalculationRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("specific-bet-type"), HttpPost]
        public async Task<IActionResult> LicenseeBetTypes(GetSpecificBetTypeRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("checking-marked-tickets"), HttpPost]
        public async Task<IActionResult> CheckingMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> Refund(RefundRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("refund-running-third-party-ticket"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> RefundRunningThirdPartyTickets(RefundRunningThirdPartyTicketRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("move-third-party-bet-ticket"), HttpPost]
        [LogPushRequest]
        public async Task<IActionResult> MoveThirdPartyBetTickets(MoveBetRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("third-party-bet-tickets-checking"), HttpPost]
        public async Task<IActionResult> ThirdPartyBetTicketsChecking(GetMatchDetailThirdPartyBetTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}