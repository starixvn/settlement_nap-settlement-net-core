using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Models;
using Settlement.Setting.Handlers;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/soccer-setting")]
public class SoccerSettingsController : ControllerBase
{
    private readonly UpdateSoccerSettingHandler updateSoccerSettingHandler;
    private readonly UpdateMatchSoccerSettingsHandler updateMatchSoccerSettings;

    public SoccerSettingsController(UpdateSoccerSettingHandler updateSoccerSettingHandler, UpdateMatchSoccerSettingsHandler updateMatchSoccerSettings)
    {
        this.updateSoccerSettingHandler = updateSoccerSettingHandler;
        this.updateMatchSoccerSettings = updateMatchSoccerSettings;
    }

    [HttpPost]
    [Route("update-settings")]
    public async Task<Result> UpdateSettingsForLeague([FromBody] UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        return command.TypeObject == "League"
            ? await updateSoccerSettingHandler.HandleAsync(command)
            : await updateMatchSoccerSettings.HandleAsync(command);
    }
}
