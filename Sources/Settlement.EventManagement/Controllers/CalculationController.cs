using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement.Controllers;

[ApiController]
[Route("api/calculation")]
public class CalculationController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("get-league")]
    public async Task<IActionResult> GetLeagues(LeagueCalculationRequest request) =>
        Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("filter")]
    public async Task<IActionResult> Filter(FilterCalculationRequest request) =>
        Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("auto-refresh")]
    public async Task<IActionResult> RefreshMatches(RefreshCalculationRequest request) =>
        Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("auto-refresh-auto-calculation")]
    public async Task<IActionResult> RefreshAutoCalculateMatches(RefreshAutoCalculationRequest request) =>
        Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("filter-auto-calculate")]
    public async Task<IActionResult> FilterAutoCalculate(FilterAutoCalculationRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}