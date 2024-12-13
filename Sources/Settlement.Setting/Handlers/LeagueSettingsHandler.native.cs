using Settlement.Core.Models;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests.LeagueSettings;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class LeagueSettingsHandler(LeagueSettingsService leagueSettingsService) :
    IRequestHandler<GetLeagueSettingsRequest, AutoSettings>,
    IRequestHandler<UpdateLeagueSettingsRequest, Result>
{
    public async Task<AutoSettings> Handle(GetLeagueSettingsRequest request, CancellationToken cancellationToken) => await leagueSettingsService.GetLeagueSettings(request);

    public async Task<Result> Handle(UpdateLeagueSettingsRequest request, CancellationToken cancellationToken) => await leagueSettingsService.UpdateLeagueSettings(request);
}