using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.Setting.Handlers;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/auto-settle-settings")]
public class AutoSettleSettingsController : ControllerBase
{
    private readonly AutoSettleSettingsHandler handler;
    private readonly UpdateAutoSettingsHandler updateAutoSettingsHandler;

    public AutoSettleSettingsController(AutoSettleSettingsHandler handler, UpdateAutoSettingsHandler updateAutoSettingsHandler)
    {
        this.handler = handler;
        this.updateAutoSettingsHandler = updateAutoSettingsHandler;
    }

    [HttpGet]
    [Route("get-settings")]
    public async Task<GetAutoSettleSettingsResponse> GetSettings([FromQuery] AutoSettleSettingsQuery query, CancellationToken cancellationToken)
    {
        return await handler.HandleAsync(query, cancellationToken);
    }

    [HttpPost]
    [Route("update-settings")]
    public async Task UpdateSettings([FromBody] UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        await updateAutoSettingsHandler.HandleAsync(command, cancellationToken);
    }
}