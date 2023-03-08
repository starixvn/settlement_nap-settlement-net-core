using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.Handlers;

public class MultiSportHandler : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<RefreshMultiSportRequest, IList<Match>>
{
    private readonly IMultiSportService multiSportService;
    private readonly PermissionService permissionService;
    private readonly GetDataFilterService getDataFilterService;

    public MultiSportHandler(
        IMultiSportService multiSportService,
        PermissionService permissionService,
        GetDataFilterService getDataFilterService)
    {
        this.multiSportService = multiSportService;
        this.permissionService = permissionService;
        this.getDataFilterService = getDataFilterService;
    }

    public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
    {
        return new MultiSportModel
        {
            Sports = await multiSportService.GetSportBook(request),
            Permission = permissionService.Permission
        };
    }

    public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeagues(request);

    public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSports(request);

    public async Task<IList<Match>> Handle(RefreshMultiSportRequest request, CancellationToken cancellationToken)
    {
        return await multiSportService.GetWaitingMatches(request);
    }
}