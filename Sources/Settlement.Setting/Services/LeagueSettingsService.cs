using Fanex.Data.Repository;
using Fanex.RemotingRef;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests.LeagueSettings;

namespace Settlement.Setting.Services;
public interface LeagueSettingsService
{
    public Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request);
}

public class LeagueSettingsServiceImp(IDynamicRepository repository, IRemotingRefService remotingRef) : LeagueSettingsService
{


    public async Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request)
    {
        var criteria = new GetLeagueSettings
        {
            LeagueId = request.LeagueId,
            SportType = request.SportType
        };

        var leagueSettings = await repository.GetAsync<LeagueSettings>(criteria);

        leagueSettings.LeagueName = remotingRef.GetLeagueName(request.LeagueId.ToString(), "EN");
        leagueSettings.Providers = (await GetProviderInfo(request.SportType)).ToList();

        return leagueSettings;
    }

    private async Task<IEnumerable<ProviderInfo>> GetProviderInfo(int sportType)
    {
        var criteria = new GetProviderInfoCriteria
        {
            SportType = sportType
        };

        return await repository.FetchAsync<ProviderInfo>(criteria); ;
    }
}
