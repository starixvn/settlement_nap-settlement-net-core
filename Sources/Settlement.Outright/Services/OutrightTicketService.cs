using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Models;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface OutrightTicketService
{
    Task<IEnumerable<TeamTicketModel>> GetTeamsTicketCount(IEnumerable<Team> teams);
}

public class OutrightTicketServiceImp(IDynamicRepository repository, IOptions<AppSettingsKey> appSettingsKey)
    : OutrightTicketService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<IEnumerable<TeamTicketModel>> GetTeamsTicketCount(IEnumerable<Team> teams)
    {
        var teamsTicketCount = await GetTicketCount(teams);

        return GroupTeamTicket(teamsTicketCount);
    }

    private async Task<IEnumerable<TeamTicketModel>> GetTicketCount(IEnumerable<Team> teams)
    {
        var orIds = string.Join(',', teams.Select(t => t.OrId));
        var teamsTicketCount = new List<TeamTicketModel>();

        foreach (var criteria in appSettingsKey.SiteDbServer.Select(server => new GetTeamTicketCountCriteria
        {
            OrIds = orIds,
            DbServer = server
        }))
        {
            var result = await repository.FetchAsync<TeamTicketModel>(criteria);
            teamsTicketCount.AddRange(result);
        }

        return teamsTicketCount;
    }

    private static IEnumerable<TeamTicketModel> GroupTeamTicket(IEnumerable<TeamTicketModel> teams)
    {
        var result = teams.GroupBy(team => team.OrId).Select(groupTeam => new TeamTicketModel
        {
            OrId = groupTeam.First().OrId,
            TotalTicket = groupTeam.Sum(item => item.TotalTicket),
            TotalCal = groupTeam.Sum(item => item.TotalCal),
            TotalHide = groupTeam.Sum(item => item.TotalHide),
            TotalRunning = groupTeam.Sum(item => item.TotalRunning)
        });
        return result;
    }
}