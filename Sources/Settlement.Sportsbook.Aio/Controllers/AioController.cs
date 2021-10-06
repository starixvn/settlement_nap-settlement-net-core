using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.Aio.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SessionAuthorize]
    public class AioController : ControllerBase
    {
        private readonly IMediator mediator;

        public AioController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("check-marked-tickets")]
        [HttpPost]
        public async Task<IActionResult> CheckMarkedTickets(CheckMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-recal-result")]
        [HttpPost]
        public async Task<IActionResult> GetRecalResult(GetRecalResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("no-running-odds")]
        [HttpPost]
        public async Task<IActionResult> VerifyNoRunningOdds(CheckRunningOddsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("save-score")]
        [LogRequestResponse]
        public async Task<IActionResult> SaveScore(SaveScoreRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle-child-match")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> SettleChildMatch(SettleChildMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("result-setting")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> ResultSetting(ResultSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}