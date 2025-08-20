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
        var (deadHeatSettings, teams, deadHeatInfos) = await repository.FetchMultipleAsync<DeadHeatSetting, Team, DeadHeatInfo>(criteria);
        var listTeams = teams.ToList();
        var groupTeam = await outrightTicketService.GetTeamsTicketCount(listTeams);

        AddTicketCountToTeam(listTeams, groupTeam.ToList());

        var sortedTeams = SortList(listTeams.ToList(),
            item => item.SportName,
            item => item.LeagueName,
            item => item.SportType == SportType.Soccer,
            item => item.SportType == SportType.OtherSports,
            item => PopularSport.IndexOf(item.SportType) > -1);

        var leagues = GroupLeague(sortedTeams, deadHeatSettings, deadHeatInfos);

        return new SportOutright
        {
            SportLeague = CreateSportOutright(leagues)
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

    private IEnumerable<LeagueMatch> GroupLeague(IEnumerable<Team> teams, IEnumerable<DeadHeatSetting> deadHeatSettings, IEnumerable<DeadHeatInfo> deadHeatInfos)
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
                    Teams = [],
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
            if (value is not null)
            {
                l.DeadHeat = value.DeadHeat;
                l.EventDate = value.EventDate;
            }

            var leagueInfo = deadHeatInfos.FirstOrDefault(item => item.LeagueId == l.LeagueId);
            if (leagueInfo is not null)
            {
                l.IsCompleted = leagueInfo.IsCompleted;
                l.DeadHeatTeam = leagueInfo.DeadHeatTeam;
            }
        });

        return listLeague;
    }
}