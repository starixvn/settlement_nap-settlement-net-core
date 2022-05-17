using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FastMarketsController : ControllerBase
    {
        private readonly IMediator mediator;

        public FastMarketsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("initial-filter")]
        [HttpGet]
        public IActionResult InitialFilter() => Ok(new FastMarketFilter());

        [Route("get-match")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetMatch(MatchDetailRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-bettype-interval")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetBetTypeInterval(BetTypeIntervalRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("checking-marked-tickets")]
        [HttpPost]
        public async Task<IActionResult> CheckingMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("settle")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("update-water-break")]
        [HttpPost]
        public async Task<IActionResult> UpdateWaterBreakSetting(UpdateWaterBreakSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-lastest-result")]
        [HttpPost]
        public async Task<IActionResult> GetLastestResult(GetLastestResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-time-machine-result")]
        [HttpPost]
        public async Task<IActionResult> GetHdpResult(GetTimeMachineResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}