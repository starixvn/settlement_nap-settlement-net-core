using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Controllers;

[ApiController]
[Route("api/bet-builder")]
[SessionAuthorize]
public class BetBuilderController : ControllerBase
{
    private readonly IMediator mediator;

    public BetBuilderController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [HttpGet]
    [Route("get-date")]
    public IActionResult GetDate()
    {
        var respond = new DateSelection
        {
            FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
            ToDate = DateTime.Today
        };

        return Ok(respond);
    }

    [HttpPost]
    [Route("search")]
    public async Task<IActionResult> Search(FilterRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("refresh-matches")]
    public async Task<IActionResult> RefreshMatches(MatchesWaitingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-leagues")]
    public async Task<IActionResult> GetLeagues(LeaguesRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-sports")]
    public async Task<IActionResult> GetSports(SportRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-selection")]
    public async Task<IActionResult> GetSelection(GetSelectionRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("settle"), HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> Settle(CalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-match")]
    public async Task<IActionResult> GetMatch(MatchInfoRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}