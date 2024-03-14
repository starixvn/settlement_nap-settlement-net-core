using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;

namespace Settlement.EventManagement.Handlers;

public class MultiSportHandler(
    IMultiSportService multiSportService,
    PermissionService permissionService,
    GetDataFilterService getDataFilterService)
    : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<RefreshMultiSportRequest, IList<MultiSportMatchWaiting>>
{
    public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);
        return new MultiSportModel
        {
            Sports = await multiSportService.GetSportBook(request, permission.IsLeader),
            Permission = permission
        };
    }

    public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeagues(request);

    public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSports(request);

    public async Task<IList<MultiSportMatchWaiting>> Handle(RefreshMultiSportRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);
        var isLeader = permission.IsLeader;
        return await multiSportService.GetWaitingMatches(request, isLeader);
    }
}