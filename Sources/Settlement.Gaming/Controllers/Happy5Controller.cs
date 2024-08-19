using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Services;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.Happy5;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Happy5Controller(
    IMediator mediator,
    Services.Happy5.PermissionService permissionService,
    HttpService httpService) : ControllerBase
{
    [Route("filter-default"), HttpGet]
    public async Task<IActionResult> Filter() => Ok
    (
        await Task.Run(() => new Happy5MatchRequest()).ConfigureAwait(false)
    );

    [Route("search"), HttpPost]
    public async Task<IActionResult> Search(Happy5MatchRequest request)
    {
        var leagues = await httpService.HttpPost<List<LeaguesModel>>("happy5/search", request);
        var happyFive = new HappyFive
        {
            Permission = permissionService.Permission,
            Leagues = leagues
        };

        return Ok(happyFive);
    }

    [Route("get-ball"), HttpGet]
    public async Task<IActionResult> GetBallsByMatch(int matchId)
    {
        var balls = await httpService.HttpGet<List<BallModel>>($"happy5/get-ball{matchId}");

        return Ok(balls);
    }

    [Route("settle"), HttpPost]
    public async Task<IActionResult> Settle(Happy5SettlementRequest request) => Ok
    (
        await mediator.Send(request).ConfigureAwait(false)
    );
}