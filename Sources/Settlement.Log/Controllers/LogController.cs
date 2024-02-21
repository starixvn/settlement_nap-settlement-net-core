using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.Log.Requests;

namespace Settlement.Log.Controllers;

[ApiController]
[Route("api/[controller]")]

public class LogController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [Route("filter")]
    public IActionResult Filter() => Ok(new LogRequest());

    [HttpPost]
    [Route("getLog")]
    public async Task<IActionResult> GetLog(LogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpGet]
    [Route("get-provider-name")]
    public async Task<IActionResult> GetProviderName()
    {
        var request = new ProviderNameRequest();
        return Ok(await mediator.Send(request).ConfigureAwait(false));
    }

    [HttpPost]
    [Route("get-provider-result")]
    public async Task<IActionResult> GetProviderResultLog(ProviderLogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}