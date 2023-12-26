using MediatR;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests.LeagueSettings;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;
public class LeagueSettingsHandler(LeagueSettingsService leagueSettingsService) : IRequestHandler<GetLeagueSettingsRequest, LeagueSettings>
{
    public async Task<LeagueSettings> Handle(GetLeagueSettingsRequest request, CancellationToken cancellationToken) => await leagueSettingsService.GetLeagueSettings(request);
}
