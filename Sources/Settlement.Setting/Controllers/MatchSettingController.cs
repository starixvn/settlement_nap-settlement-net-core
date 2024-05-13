using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/setting")]
public class MatchSettingController : ControllerBase
{
    private readonly IMediator mediator;

    public MatchSettingController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [HttpGet]
    [Route("get-league-name")]
    public async Task<IActionResult> GetLeagueName(int leagueId)
    {
        var request = new LeagueRequest { LeagueId = leagueId };
        var leagueName = await mediator.Send(request).ConfigureAwait(false);
        var league = new
        {
            leagueName
        };

        return Ok(league);
    }

    [HttpPost]
    [Route("proceed")]
    public async Task<IActionResult> Proceed(TimeSettingRequest request)
        => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("update-setting-match")]
    public async Task<IActionResult> UpdateSettingMatch(SettingMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("update-setting-league")]
    public async Task<IActionResult> UpdateSettingLeague(SettingLeagueRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-remark-info")]
    public async Task<IActionResult> GetRemarkInfo(GetRemarkInfoRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("update-holdmatch-setting")]
    public async Task<IActionResult> UpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("get-setting")]
    public async Task<IActionResult> GetSetting(GetSettingRequest request)
    {
        var setting = await mediator.Send(request).ConfigureAwait(false);
        var settingValue = new
        {
            setting
        };

        return Ok(settingValue);
    }
}