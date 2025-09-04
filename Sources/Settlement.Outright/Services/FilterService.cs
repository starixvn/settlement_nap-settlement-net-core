using AutoMapper;
using Fanex.Data.Repository;
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

public class FilterServiceImp(
    IDynamicRepository repository,
    IBalanceUpService balanceUpService,
    IMapper mapper,
    IRefDataService refDataService,
    OutrightTicketService outrightTicketService)
    : FilterService
{
    private static readonly List<int> PopularSport =
        [SportType.Soccer, SportType.Badminton, SportType.BasketBall, SportType.ESports, SportType.Tennis];

    public FilterViewModel GetFilterView()
    {
        return new FilterViewModel
        {
            MoveBetsDay = balanceUpService.GetBalanceUpDay().MoveBetsDay.AddDays(1),
            FromDate = DateTimeOffset.Now.AddDays(-1),
            ToDate = DateTimeOffset.Now.Date
        };
    }

    public async Task<SportLeague> GetSportLeague(SportLeagueRequest request)
    {
        var criteria = mapper.Map<SportLeagueRequest, GetOutrightSportLeaguesCriteria>(request);

        var leagues = (await repository.FetchAsync<League>(criteria));

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
            item => PopularSport.Contains(item.SportType));

        return new SportLeague
        {
            Leagues = sortedLeague,
            Sports = GenerateSport(sortedLeague)
        };
    }

    public async Task<SportOutright> Filter(FilterRequest request)
    {
        var criteria = mapper.Map<FilterRequest, GetOutrightDetailCriteria>(request);
        var (deadHeatSettings, teams, deadHeatInfos) = await repository.FetchMultipleAsync<DeadHeatSetting, Team, LeagueSpecialIndicate>(criteria);

        var teamList = teams.ToList();
        var teamTickets = await outrightTicketService.GetTeamsTicketCount(teamList);

        AddTicketCountToTeam(teamList, teamTickets.ToList());

        var sortedTeams = SortList(teamList,
            item => item.SportName,
            item => item.LeagueName,
            item => item.SportType == SportType.Soccer,
            item => item.SportType == SportType.OtherSports,
            item => PopularSport.Contains(item.SportType));

        var leagues = GroupLeague(sortedTeams, deadHeatSettings, deadHeatInfos);

        return new SportOutright
        {
            SportLeague = CreateSportOutright(leagues)
        };
    }

    private static List<OutrightModel> CreateSportOutright(IEnumerable<LeagueMatch> leagues)
    {
        return leagues
            .GroupBy(league => league.SportName)
            .Select(group => new OutrightModel
            {
                SportName = group.Key,
                LeagueMatch = group
            })
            .ToList();
    }

    private static List<T> SortList<T>(List<T> items, Func<T, string> sportName, Func<T, string> leagueName, Func<T, bool> soccerOnTop, Func<T, bool> otherSportBottom, Func<T, bool> popularSport)
    {
        var sortBySportName = items.OrderBy(sportName).ThenBy(leagueName);
        return sortBySportName.OrderByDescending(soccerOnTop)
            .ThenBy(otherSportBottom)
            .ThenByDescending(popularSport).ToList();
    }

    private static IEnumerable<Sport> GenerateSport(IEnumerable<League> leagues)
    {
        return leagues
            .GroupBy(league => league.SportType)
            .Select(group => group.First())
            .Select(league => new Sport
            {
                SportType = league.SportType,
                SportName = league.SportName,
                Group = PopularSport.Contains(league.SportType) ? SportGroup.PopularGroup : SportGroup.OtherGroup
            });
    }

    private void AddTicketCountToTeam(IEnumerable<Team> teams, ICollection<TeamTicketModel> teamTickets)
    {
        var ticketLookup = teamTickets.ToDictionary(t => t.OrId, t => t.TotalTicket);

        foreach (var team in teams)
        {
            team.RefDataService = refDataService;
            if (ticketLookup.TryGetValue(team.OrId, out var ticketCount))
            {
                team.BetCount = ticketCount;
            }
        }
    }

    private IEnumerable<LeagueMatch> GroupLeague(IEnumerable<Team> teams, IEnumerable<DeadHeatSetting> deadHeatSettings, IEnumerable<LeagueSpecialIndicate> leagueSpecialIndicates)
    {
        var deadHeatLookup = deadHeatSettings.ToDictionary(d => d.LeagueId, d => d);
        var leagueInfoLookup = leagueSpecialIndicates.ToDictionary(l => l.LeagueId, l => l);

        return teams
            .GroupBy(t => t.LeagueId)
            .Select(group =>
            {
                var firstTeam = group.First();
                var league = new LeagueMatch
                {
                    LeagueName = firstTeam.LeagueName,
                    LeagueId = group.Key,
                    Teams = group.ToList(),
                    SportName = refDataService.GetSportName(firstTeam.SportType)
                };

                if (deadHeatLookup.TryGetValue(league.LeagueId, out var deadHeatSetting))
                {
                    league.DeadHeat = deadHeatSetting.DeadHeat;
                    league.EventDate = deadHeatSetting.EventDate;
                }

                if (leagueInfoLookup.TryGetValue(league.LeagueId, out var leagueInfo))
                {
                    league.HighLight = leagueInfo.HighLight;
                }

                return league;
            });
    }
}