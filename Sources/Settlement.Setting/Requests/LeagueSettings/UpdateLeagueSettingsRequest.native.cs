using Settlement.Core.Models;
using Settlement.Setting.Models.LeagueSettings;

namespace Settlement.Setting.Requests.LeagueSettings;
public class UpdateLeagueSettingsRequest : IRequest<Result>
{
    public bool IsApplyAll { get; set; }

    public UpdateLeagueSettingQuery OldSettings { get; set; }

    public UpdateLeagueSettingQuery NewSettings { get; set; }
}
