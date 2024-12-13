using Microsoft.AspNetCore.Mvc;
using Settlement.Setting.Requests.LeagueSettings;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/league-settings")]
public class LeagueSettingsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("get-settings")]
    public async Task<IActionResult> Proceed(GetLeagueSettingsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("update-settings")]
    public async Task<IActionResult> Proceed(UpdateLeagueSettingsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}
