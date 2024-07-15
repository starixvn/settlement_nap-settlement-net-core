using Settlement.Core.Services;
using Settlement.Gaming.Models.Happy5;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming.Services.Happy5;

public interface LeagueService
{
    Task<List<LeaguesModel>> Search(Happy5MatchRequest request);
}

public class LeagueServiceImp(
    MatchService matchService,
    IRefDataService refDataService)
    : LeagueService
{
    public async Task<List<LeaguesModel>> Search(Happy5MatchRequest request)
    {
        var matches = await matchService.Matches(request);

        return await CreateLeagues(matches);
    }

    private async Task<List<LeaguesModel>> CreateLeagues(List<MatchDetail> matches)
    {
        var leagueIds = matches.GroupBy(m => m.LeagueId).Select(m => m.Key).ToList();
        var leagues = new List<LeaguesModel>();
        foreach (var leagueId in leagueIds)
        {
            var matchesByLeagueId = matches.Where(m => m.LeagueId == leagueId).ToList();
            var league = await LeagueItem(leagueId, matchesByLeagueId);
            leagues.Add(league);
        }

        return leagues;
    }

    private async Task<LeaguesModel> LeagueItem(int leagueId, List<MatchDetail> matches)
    {
        var league = new LeaguesModel
        {
            LeagueId = leagueId,
            Matches = matches,
            RefDataService = refDataService
        };

        return await Task.Run(() => league);
    }
}