using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using System.Diagnostics;

namespace Settlement.EventManagement.Handlers;

public class MultiSportHandler(
    IMultiSportService multiSportService,
    PermissionService permissionService,
    GetDataFilterService getDataFilterService)
    : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<Sport>>
{
    public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
    {
        Stopwatch stopwatch = Stopwatch.StartNew();
        var permission = permissionService.Permission;
        var result = new MultiSportModel
        {
            Sports = await multiSportService.GetSportBook(request, permission.IsLeader),
            Permission = permissionService.Permission
        };
        stopwatch.Stop();
        Debug.WriteLine($"MultiSportHandler.Handle took {stopwatch.ElapsedMilliseconds} ms for request: {request.GetType().Name}");

        return result;
    }

    public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeagues(request);

    public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSports(request);
}