using MediatR;
using Settlement.Core.ActionFilters;
using Settlement.Gaming.Requests;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Gaming.Controllers;

[ApiController]
[Route("api/[controller]")]
[SessionAuthorize]
public class Happy5Controller : ControllerBase
{
    private readonly IMediator mediator;

    public Happy5Controller(IMediator mediator)
    {
        this.mediator = mediator;
    }

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