using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface FilterService
{
    Task<FilterViewModel> GetFilterView();

    Task<IEnumerable<League>> GetLeague(LeagueRequest request);

    Task<OutrightModel> Filter(FilterRequest request);
}

public class FilterServiceImp : FilterService
{
    private readonly IDynamicRepository repository;
    private readonly IBalanceUpService balanceUpService;
    private readonly IMapper mapper;
    private readonly OutrightPermissionService permissionService;
    private readonly IRefDataService refDataService;
    private readonly AppSettingsKey appSettingsKey;

    public FilterServiceImp(
        IDynamicRepository repository,
        IBalanceUpService balanceUpService,
        IMapper mapper,
        OutrightPermissionService permissionService,
        IRefDataService refDataService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.balanceUpService = balanceUpService;
        this.mapper = mapper;
        this.permissionService = permissionService;
        this.refDataService = refDataService;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<FilterViewModel> GetFilterView()
    {
        var requestLeague = new LeagueRequest
        {
            FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
            ToDate = DateTime.Today,
            SportType = SportType.Soccer
        };

        return new FilterViewModel
        {
            Sports = Sports,
            MoveBetsDay = balanceUpService.GetBalanceUpDay().MoveBetsDay.AddDays(1),
            Leagues = await GetLeague(requestLeague),
            FromDate = requestLeague.FromDate,
            ToDate = requestLeague.ToDate
        };
    }

    public async Task<IEnumerable<League>> GetLeague(LeagueRequest request)
    {
        var criteria = mapper.Map<LeagueRequest, GetOutrightLeaguesCriteria>(request);

        return await repository.FetchAsync<League>(criteria);
    }

    public async Task<OutrightModel> Filter(FilterRequest request)
    {
        var criteria = mapper.Map<FilterRequest, GetOutrightDetailCriteria>(request);
        var listTeam = (await repository.FetchAsync<Team>(criteria)).ToList();

        // TO DO
        var teamTickets = await GetTeamsTicketCount(listTeam);
        var group = GroupTeamTicket(teamTickets.ToList());

        AddTicketCountToTeam(listTeam, group.ToList());

        return new OutrightModel
        {
            LeagueMatch = GroupLeague(listTeam),
            Permission = permissionService.Permission
        };
    }

    private void AddTicketCountToTeam(List<Team> teams, List<TeamTicketModel> teamTickets)
    {
        foreach (var team in teams)
        {
            var foundTeam = teamTickets.FirstOrDefault(t => t.OrId == team.OrId);
            if (foundTeam is not null)
            {
                team.BetCount = foundTeam.TotalTicket;
            }
        }
    }

    private async Task<IEnumerable<TeamTicketModel>> GetTeamsTicketCount(List<Team> teams)
    {
        var orIds = string.Join(',', teams.Select(t => t.OrId));
        var teamsTicketCount = new List<TeamTicketModel>();

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            var criteria = new GetTeamTicketCountCriteria
            {
                OrIds = orIds,
                DbServer = server
            };

            var result = await repository.FetchAsync<TeamTicketModel>(criteria);
            teamsTicketCount.AddRange(result);
        }

        return teamsTicketCount;
    }

    private IEnumerable<TeamTicketModel> GroupTeamTicket(List<TeamTicketModel> teams)
    {
        var result = teams.GroupBy(team => team.OrId).Select(groupTeam => new TeamTicketModel
        {
            OrId = groupTeam.First().OrId,
            TotalTicket = groupTeam.Sum(item => item.TotalTicket)
        });

        return result;
    }

    private IEnumerable<LeagueMatch> GroupLeague(IEnumerable<Team> teams)
    {
        var currentLeague = 0;
        var leagues = new List<LeagueMatch>();
        var league = new LeagueMatch();
        foreach (var team in teams)
        {
            team.RefDataService = refDataService;
            if (currentLeague.Equals(team.LeagueId))
            {
                league.Teams.Add(team);
            }
            else
            {
                league = new LeagueMatch
                {
                    LeagueName = team.LeagueName,
                    LeagueId = team.LeagueId,
                    Teams = new List<Team>(),
                };

                currentLeague = team.LeagueId;
                league.Teams.Add(team);
                leagues.Add(league);
            }
        }

        return leagues;
    }

    private IEnumerable<Sport> Sports => repository.Fetch<Sport>(new GetSportListCriteria());
}