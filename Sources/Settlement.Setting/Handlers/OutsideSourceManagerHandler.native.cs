using Settlement.Core.Models;
using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Setting.Requests.OutsideSourceManager;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class OutsideSourceManagerHandler(OutsideSourceSettingService outsideSourceSettingService) :
    IRequestHandler<AddOutsideSourceRequest, AddSourceResult>,
    IRequestHandler<GetLeagueOutsideSourceRequest, LeagueOutsideSourceModel>,
    IRequestHandler<GetOutsideSourceRequest, List<OutsideSourceModel>>,
    IRequestHandler<UpdateLeagueOutsideSourceRequest, Result>,
    IRequestHandler<UpdateOutsideSourceRequest, Result>
{
    public async Task<AddSourceResult> Handle(AddOutsideSourceRequest request, CancellationToken cancellationToken)
        => await outsideSourceSettingService.AddOutsideSource(request);

    public async Task<LeagueOutsideSourceModel> Handle(GetLeagueOutsideSourceRequest request, CancellationToken cancellationToken)
        => await outsideSourceSettingService.GetLeagueOutsideSource(request);

    public async Task<List<OutsideSourceModel>> Handle(GetOutsideSourceRequest request, CancellationToken cancellationToken)
        => await outsideSourceSettingService.GetOutsideSource(request);

    public async Task<Result> Handle(UpdateLeagueOutsideSourceRequest request, CancellationToken cancellationToken)
        => await outsideSourceSettingService.UpdateLeagueOutsideSource(request);

    public async Task<Result> Handle(UpdateOutsideSourceRequest request, CancellationToken cancellationToken)
        => await outsideSourceSettingService.UpdateOutsideSource(request);
}