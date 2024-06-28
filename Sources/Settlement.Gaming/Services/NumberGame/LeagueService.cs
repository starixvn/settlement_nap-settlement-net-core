using Settlement.Services;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Models.NumberGame;

namespace Settlement.Gaming.Services.NumberGame;

public interface LeagueService
{
    Task<List<LeaguesModel>> Search(NumberGameMatchRequest request);
}

public class LeagueServiceImp(
    MatchService matchService,
    IRefDataService refDataService)
    : LeagueService
{
    public async Task<List<LeaguesModel>> Search(NumberGameMatchRequest request)
    {
        var matches = await matchService.Matches(request);

        return await CreateLeagues(matches);
    }

    private async Task<List<LeaguesModel>> CreateLeagues(List<MatchDetailModel> matches)
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

    private async Task<LeaguesModel> LeagueItem(int leagueId, List<MatchDetailModel> matches)
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