using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AioController(IMediator mediator) : ControllerBase
{
    [Route("get-match")]
    [HttpPost]
    [LogGetRequest]
    public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("settle")]
    [HttpPost]
    [LogPushRequest]
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
    [LogPushRequest]
    public async Task<IActionResult> SaveScore(SaveScoreRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("settle-child-match")]
    [HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> SettleChildMatch(SettleChildMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("update-settlement-result-history-status")]
    [HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> UpdateSettlementResultHistoryStatus(UpdateSettlementResultHistoryStatusRequest request)
        => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("result-setting")]
    [HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> ResultSetting(ResultSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("results/{mathId}")]
    [HttpGet]
    public async Task<IActionResult> GetResults(int mathId)
        => Ok(await mediator.Send(new GetResultsRequest(mathId)).ConfigureAwait(false));

}