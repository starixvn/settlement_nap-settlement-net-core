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
    FilterViewModel GetFilterView();

    Task<SportLeague> GetSportLeague(SportLeagueRequest request);

    Task<SportOutright> Filter(FilterRequest request);
}

public class FilterServiceImp : FilterService
{
    private static readonly List<int> PopularSport = new() { SportType.Soccer, SportType.Badminton, SportType.BasketBall, SportType.ESports, SportType.Tennis };
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

    public FilterViewModel GetFilterView()
    {
        return new FilterViewModel
        {
            MoveBetsDay = balanceUpService.GetBalanceUpDay().MoveBetsDay.AddDays(1),
            FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
            ToDate = DateTime.Today
        };
    }

    public async Task<SportLeague> GetSportLeague(SportLeagueRequest request)
    {
        var criteria = mapper.Map<SportLeagueRequest, GetOutrightSportLeaguesCriteria>(request);

        var leagues = (await repository.FetchAsync<League>(criteria)).ToList();

        foreach (var item in leagues)
        {
            item.SportName = refDataService.GetSportName(item.SportType);
            item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
            item.Group = $"All {item.SportName} Leagues";
        }

        var sortedLeague = SortList(leagues.ToList(),
            item => item.SportName,
            item => item.LeagueName,
            item => item.SportType == SportType.Soccer,
            item => item.SportType == SportType.OtherSports,
            item => PopularSport.IndexOf(item.SportType) > -1);

        return new SportLeague
        {
            Leagues = sortedLeague,
            Sports = GenerateSport(sortedLeague)
        };
    }

    public async Task<SportOutright> Filter(FilterRequest request)
    {
        var criteria = mapper.Map<FilterRequest, GetOutrightDetailCriteria>(request);
        var (deadHeatSettings, teams) = await repository.FetchMultipleAsync<DeadHeatSetting, Team>(criteria);
        var listTeams = teams.ToList();
        var teamTickets = await GetTeamsTicketCount(listTeams);
        var group = GroupTeamTicket(teamTickets.ToList());

        AddTicketCountToTeam(listTeams, group.ToList());

        var sortedTeams = SortList(listTeams,
            item => item.SportName,
            item => item.LeagueName,
            item => item.SportType == SportType.Soccer,
            item => item.SportType == SportType.OtherSports,
            item => PopularSport.IndexOf(item.SportType) > -1);

        var leagues = GroupLeague(sortedTeams, deadHeatSettings);

        return new SportOutright
        {
            SportLeague = CreateSportOutright(leagues),
            Permission = permissionService.Permission
        };
    }

    private static IEnumerable<OutrightModel> CreateSportOutright(IEnumerable<LeagueMatch> leagues)
    {
        var leagueGrouped = leagues.GroupBy(item => item.SportName);
        return leagueGrouped.Select(league => new OutrightModel { SportName = league.Key, LeagueMatch = league }).ToList();
    }

    public static List<T> SortList<T>(List<T> items, Func<T, string> sportName, Func<T, string> leagueName, Func<T, bool> soccerOnTop, Func<T, bool> otherSportBottom, Func<T, bool> popularSport)
    {
        var sortBySportName = items.OrderBy(sportName).ThenBy(leagueName);
        return sortBySportName.OrderByDescending(soccerOnTop)
            .ThenBy(otherSportBottom)
            .ThenByDescending(popularSport).ToList();
    }

    private static IEnumerable<Sport> GenerateSport(IEnumerable<League> leagues)
    {
        var listLeagueDistinct = leagues.GroupBy(league => league.SportType).Select(league => league.First());
        return listLeagueDistinct.Select(item =>
            new Sport
            {
                SportType = item.SportType,
                SportName = item.SportName,
                Group = PopularSport.Exists(sport => sport == item.SportType) ? SportGroup.PopularGroup : SportGroup.OtherGroup
            });
    }

    private void AddTicketCountToTeam(IEnumerable<Team> teams, ICollection<TeamTicketModel> teamTickets)
    {
        foreach (var team in teams)
        {
            team.RefDataService = refDataService;
            var foundTeam = teamTickets.FirstOrDefault(t => t.OrId == team.OrId);
            if (foundTeam is not null)
            {
                team.BetCount = foundTeam.TotalTicket;
            }
        }
    }

    private async Task<IEnumerable<TeamTicketModel>> GetTeamsTicketCount(IEnumerable<Team> teams)
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
            TotalTicket = groupTeam.Sum(item => item.TotalTicket)
        });
        return result;
    }

    private IEnumerable<LeagueMatch> GroupLeague(IEnumerable<Team> teams, IEnumerable<DeadHeatSetting> deadHeatSettings)
    {
        var currentLeague = 0;
        var listLeague = new List<LeagueMatch>();
        var league = new LeagueMatch();
        foreach (var team in teams)
        {
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
                    SportName = refDataService.GetSportName(team.SportType)
                };

                currentLeague = team.LeagueId;
                league.Teams.Add(team);
                listLeague.Add(league);
            }
        }

        listLeague.ForEach(l =>
        {
            var value = deadHeatSettings.FirstOrDefault(item => item.LeagueId == l.LeagueId);
            if (value != null)
            {
                l.DeadHeat = value.DeadHeat;
                l.EventDate = value.EventDate;
            }
        });

        return listLeague;
    }
}