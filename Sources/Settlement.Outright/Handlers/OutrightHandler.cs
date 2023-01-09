using MediatR;
using Settlement.Core.Services;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler :
        IRequestHandler<LeagueRequest, IEnumerable<League>>,
        IRequestHandler<FilterRequest, OutrightModel>

{
    private readonly FilterService getDataFilterService;
    private readonly IRefDataService refDataService;
    private readonly PermissionService permissionService;

    public OutrightHandler(FilterService getDataFilterService, PermissionService permissionService, IRefDataService refDataService)
    {
        this.getDataFilterService = getDataFilterService;
        this.permissionService = permissionService;
        this.refDataService = refDataService;
    }

    public async Task<IEnumerable<League>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeague(request);

    public async Task<OutrightModel> Handle(FilterRequest request, CancellationToken cancellationToken) => await getDataFilterService.Filter(request);
}