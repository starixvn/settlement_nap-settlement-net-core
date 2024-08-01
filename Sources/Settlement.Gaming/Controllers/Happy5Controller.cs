using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Happy5Controller(IMediator mediator) : ControllerBase
{
    [Route("filter-default"), HttpGet]
    public async Task<IActionResult> Filter() => Ok
    (
        await Task.Run(() => new Happy5MatchRequest()).ConfigureAwait(false)
    );

    [Route("search"), HttpPost]
    public async Task<IActionResult> Search(Happy5MatchRequest request) => Ok
    (
        await mediator.Send(request).ConfigureAwait(false)
    );

    [Route("get-ball"), HttpGet]
    public async Task<IActionResult> GetBallsByMatch(int matchId)
    {
        var request = new Happy5BallsRequest
        {
            MatchId = matchId
        };

        return Ok(await mediator.Send(request).ConfigureAwait(false));
    }

    [Route("settle"), HttpPost]
    public async Task<IActionResult> Settle(Happy5SettlementRequest request) => Ok
    (
        await mediator.Send(request).ConfigureAwait(false)
    );
}