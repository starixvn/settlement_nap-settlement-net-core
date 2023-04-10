using MediatR;
using Settlement.Log.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;

namespace Settlement.Log.Controllers;

[ApiController]
[Route("api/[controller]")]
[SessionAuthorize]
public class LogController : ControllerBase
{
    private readonly IMediator mediator;

    public LogController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [AllowAnonymous]
    [HttpGet]
    [Route("filter")]
    public IActionResult Filter() => Ok(new LogRequest());

    [HttpPost]
    [Route("getLog")]
    public async Task<IActionResult> GetLog(LogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
}