using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/auto-settle-settings")]
public class AutoSettleSettingsController : ControllerBase
{
    private readonly IMediator mediator;

    public AutoSettleSettingsController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [HttpGet]
    [Route("get-settings")]
    public async Task<GetAutoSettleSettingsResponse> GetSettings([FromQuery] AutoSettleSettingsQuery query, CancellationToken cancellationToken)
        => await mediator.Send(query, cancellationToken);

    [HttpPost]
    [Route("update-settings")]
    public async Task<Result> UpdateSettings([FromBody] UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
        => await mediator.Send(command, cancellationToken);
}