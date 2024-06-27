using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Controllers;

[ApiController]
[Route("api/fast-market")]
public class FastMarketsController(IMediator mediator) : ControllerBase
{
    [Route("initial-filter"), HttpGet]
    public IActionResult InitialFilter() => Ok(new FastMarketFilter());

    [Route("get-match"), HttpPost]
    [LogGetRequest]
    public async Task<IActionResult> GetMatch(MatchDetailRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-bettype-interval"), HttpPost]
    [LogGetRequest]
    public async Task<IActionResult> GetBetTypeInterval(BetTypeIntervalRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("checking-marked-tickets"), HttpPost]
    public async Task<IActionResult> CheckingMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("settle"), HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> Settle(SettleRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("update-water-break"), HttpPost]
    public async Task<IActionResult> UpdateWaterBreakSetting(UpdateWaterBreakSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-latest-result"), HttpPost]
    public async Task<IActionResult> GetLatestResult(GetLatestResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-time-machine-result"), HttpPost]
    public async Task<IActionResult> GetHdpResult(GetTimeMachineResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-ou-result"), HttpPost]
    public async Task<IActionResult> GetOuTimeMachineResult(GetOuTimeMachineResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("insert-message-letstalk"), HttpPost]
    public async Task<IActionResult> InsertMessageToLetstalk(InsertMessageRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}