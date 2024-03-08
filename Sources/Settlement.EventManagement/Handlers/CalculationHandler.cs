using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services.Calculation;

namespace Settlement.EventManagement.Handlers;

public class CalculationHandler(
    PermissionService permissionService,
    LeagueService leagueService,
    MatchService matchService)
    :
        IRequestHandler<FilterCalculationRequest, CalculationLeagues>,
        IRequestHandler<LeagueCalculationRequest, List<LeagueTypeModel>>,
        IRequestHandler<RefreshCalculationRequest, List<CalculateMatchWaiting>>,
        IRequestHandler<FilterAutoCalculationRequest, CalculationLeagues>,
        IRequestHandler<RefreshAutoCalculationRequest, List<CalculateMatchWaiting>>
{
    public async Task<CalculationLeagues> Handle(FilterCalculationRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);
        var matches = await matchService.GetMatches(request);

        return new CalculationLeagues
        {
            Leagues = leagueService.Leagues(matches),
            Permission = permission
        };
    }

    public async Task<List<LeagueTypeModel>> Handle(LeagueCalculationRequest request, CancellationToken cancellationToken) => await leagueService.Leagues(request);

    public async Task<List<CalculateMatchWaiting>> Handle(RefreshCalculationRequest request, CancellationToken cancellationToken) => await matchService.GetWaitingMatches(request.LeagueIds, false);

    public async Task<List<CalculateMatchWaiting>> Handle(RefreshAutoCalculationRequest request,
        CancellationToken cancellationToken) => await matchService.GetWaitingMatches(request.LeagueId.ToString(), true);

    public async Task<CalculationLeagues> Handle(FilterAutoCalculationRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);
        var matches = await matchService.GetMatchesAutoCalculate(request);
        return new CalculationLeagues
        {
            Leagues = leagueService.Leagues(matches),
            Permission = permission
        };
    }
}