using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.ActionFilters;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.Controllers;

[ApiController]
[Route("api/[controller]")]

public class OtherSportsController(IMediator mediator) : ControllerBase
{
    [Route("get-match"), HttpPost]
    [LogGetRequest]
    public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("calculate"), HttpPost]
    [LogPushRequest]
    public async Task<IActionResult> Calculate(CalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("check-marked-tickets"), HttpPost]
    public async Task<IActionResult> CheckMarkedTickets(CheckingMarkedTicketsRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [Route("get-latest-result"), HttpPost]
    public async Task<IActionResult> GetLatestResult(GetLatestResultRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}