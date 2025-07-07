using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoveTicketController(IMediator mediator) : ControllerBase
{
    [Route("get-match")]
    [HttpPost]
    public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("move-ticket")]
    [HttpPost]
    public async Task<IActionResult> MoveTicket(MoveTicketRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("validate-matches")]
    [HttpPost]
    public async Task<IActionResult> ValidateMatches(ValidateMatchesRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-move-tickets-matches")]
    [HttpPost]
    [LogGetRequest]
    public async Task<IActionResult> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("move-running-tickets")]
    [HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> MoveRunningTickets(MoveRunningTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-auto-move-status")]
    [HttpPost]
    public async Task<IActionResult> GetAutoMoveStatus(GetAutoMoveStatusRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}