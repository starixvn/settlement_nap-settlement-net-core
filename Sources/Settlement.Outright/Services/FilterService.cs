using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;
using Settlement.Outright.Requests;
using Settlement.Services.Outright;

namespace Settlement.Outright.Services;

public interface FilterService
{
    Task<FilterViewModel> GetFilterView();

    Task<IEnumerable<League>> GetLeague(LeagueRequest request);

    Task<OutrightModel> Filter(FilterRequest request);
}

public class FilterServiceImp : FilterService
{
    private readonly ICacheService cacheService;
    private readonly IDynamicRepository repository;
    private readonly IBalanceUpService balanceUpService;
    private readonly IMapper mapper;
    private readonly OutrightPermissionService permissionService;
    private readonly IRefDataService refDataService;

    public FilterServiceImp(
        IDynamicRepository repository,
        ICacheService cacheService,
        IBalanceUpService balanceUpService,
        IMapper mapper,
        OutrightPermissionService permissionService,
        IRefDataService refDataService)
    {
        this.repository = repository;
        this.cacheService = cacheService;
        this.balanceUpService = balanceUpService;
        this.mapper = mapper;
        this.permissionService = permissionService;
        this.refDataService = refDataService;
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
            Sports = cacheService.GetOrSet(
                $"{CacheServiceKey.MemoryCacheSportListCacheKey}", () => Sports),
            MoveBetsDay = balanceUpService.GetBalanceUpDay().MoveBetsDay.AddDays(1),
            Leagues = await GetLeague(requestLeague),
            FromDate = requestLeague.FromDate,
            ToDate = requestLeague.ToDate
        };
    }

    public async Task<IEnumerable<League>> GetLeague(LeagueRequest request)
    {
        var criteria = mapper.Map<LeagueRequest, GetOutrightLeaguesCriteria>(request);

        return (await repository.FetchAsync<League>(criteria)).ToList();
    }

    public async Task<OutrightModel> Filter(FilterRequest request)
    {
        var criteria = mapper.Map<FilterRequest, GetOutrightDetailCriteria>(request);
        var listTeam = await repository.FetchAsync<Team>(criteria);
        return new OutrightModel
        {
            LeagueMatch = GroupLeague(listTeam),
            Permission = permissionService.Permission
        };
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

        return leagues.ToList();
    }

    private IEnumerable<Sport> Sports => repository.Fetch<Sport>(new GetSportListCriteria());
}