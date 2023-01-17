using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Outright.Controllers;

[ApiController]
[Route("api/outright")]
[SessionAuthorize]
public class OutrightController : ControllerBase
{
    private readonly IMediator mediator;

    private readonly FilterService getDataFilterService;

    public OutrightController(IMediator mediator, FilterService getDataFilterService)
    {
        this.mediator = mediator;
        this.getDataFilterService = getDataFilterService;
    }

    [HttpGet]
    [Route("get-filter-view")]
    public async Task<IActionResult> GetFilerView() => Ok(await getDataFilterService.GetFilterView());

    [HttpPost]
    [Route("get-league")]
    public async Task<IActionResult> GetLeagues(LeagueRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("filter")]
    public async Task<IActionResult> Filter(FilterRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-league-info")]
    public async Task<IActionResult> GetLeagueInfo(GetLeagueInfoRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("uncalculate")]
    public async Task<IActionResult> Uncalculate(OutrightUndoRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-log")]
    public async Task<IActionResult> GetLeagues(GetLogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}