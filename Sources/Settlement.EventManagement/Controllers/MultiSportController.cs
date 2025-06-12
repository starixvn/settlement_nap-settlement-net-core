using Microsoft.AspNetCore.Authorization;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement.Controllers;

[ApiController]
[Route("api/multi-sports")]
public class MultiSportController(
    IMediator mediator,
    PermissionService permissionService,
    HttpService httpService) : ControllerBase
{
    [HttpGet]
    [Route("get-date")]
    public IActionResult GetDate()
    {
        var respond = new DateSelection
        {
            FromDate = DateTimeOffset.Now.AddDays(-1),
            ToDate = DateTimeOffset.Now
        };

        return Ok(respond);
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("filter")]
    public async Task<IActionResult> Filter(FilterMultiSportRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("auto-refresh")]
    public async Task<IActionResult> RefreshMatches(RefreshMultiSportRequest request)
    {
        request.IsLeader = permissionService.Permission.IsLeader;
        var matches = await httpService.HttpPost<List<MultiSportMatchWaiting>>("multi-sports/auto-refresh", request);

        return Ok(matches ?? []);
    }

    [HttpPost]
    [Route("getSport")]
    public async Task<IActionResult> GetSports(SportRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("getLeague")]
    public async Task<IActionResult> GetLeagues(LeagueRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}