using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Outright.Services;

namespace Settlement.Outright.Controllers;

[ApiController]
[Route("api/outright/")]
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
    public IActionResult GetFilerView() => Ok(getDataFilterService.GetFilterView());

    [HttpPost]
    [Route("update-deadheat-setting")]
    public async Task<IActionResult> UpdateDeadHeatSettingAsync(UpdateDeadHeatSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-sport-league")]
    public async Task<IActionResult> GetLeagues(SportLeagueRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

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
    [Route("calculate")]
    public async Task<IActionResult> Calculate(OutrightCalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-log")]
    public async Task<IActionResult> GetLeagues(GetLogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("check-void-tickets")]
    public async Task<IActionResult> CheckVoidTickets(CheckOutrightVoidTicketRequest request)
        => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-deadheat-setting")]
    public async Task<IActionResult> GetDeadHeatSetting(GetDeatHeadLeagueSettingRequest request)
       => Ok(await mediator.Send(request).ConfigureAwait(false));
}