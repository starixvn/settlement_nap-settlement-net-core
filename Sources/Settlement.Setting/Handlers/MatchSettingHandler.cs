using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class MatchSettingHandler :
        IRequestHandler<SettingMatchRequest, Result>,
        IRequestHandler<SettingLeagueRequest, Result>,
        IRequestHandler<GetRemarkInfoRequest, MatchAndPermission>,
        IRequestHandler<UpdateRemarkRequest, MatchAndPermission>,
        IRequestHandler<TimeSettingRequest, Result>,
        IRequestHandler<LeagueRequest, string>,
        IRequestHandler<GetSettingRequest, string>,
        IRequestHandler<UpdateHoldMatchSettingRequest, MatchAndPermission>

{
    private readonly SettingService settingService;
    private readonly IRefDataService refDataService;
    private readonly PermissionService permissionService;

    public MatchSettingHandler(SettingService settingService, PermissionService permissionService, IRefDataService refDataService)
    {
        this.settingService = settingService;
        this.permissionService = permissionService;
        this.refDataService = refDataService;
    }

    public async Task<Result> Handle(SettingMatchRequest request, CancellationToken cancellationToken) => await settingService.UpdateSettingMatch(request);

    public async Task<Result> Handle(SettingLeagueRequest request, CancellationToken cancellationToken) => await settingService.UpdateSettingLeague(request);

    public async Task<MatchAndPermission> Handle(GetRemarkInfoRequest request, CancellationToken cancellationToken)
    {
        var match = await settingService.GetRemarkInfo(request.MatchId);
        return new MatchAndPermission
        {
            Permission = permissionService.Permission,
            Match = match
        };
    }

    public async Task<MatchAndPermission> Handle(UpdateRemarkRequest request, CancellationToken cancellationToken)
    {
        await settingService.UpdateRemarkSetting(request);
        var match = await settingService.GetRemarkInfo(request.MatchId);
        return new MatchAndPermission
        {
            Permission = permissionService.Permission,
            Match = match
        };
    }

    public async Task<Result> Handle(TimeSettingRequest request, CancellationToken cancellationToken) => await settingService.UpdateTimeSettingLeague(request);

    public async Task<string> Handle(LeagueRequest request, CancellationToken cancellationToken) => await Task.Run(() => refDataService.GetLeagueName(request.LeagueId), cancellationToken);

    public async Task<string> Handle(GetSettingRequest request, CancellationToken cancellationToken) => await settingService.GetSetting(request);

    public async Task<MatchAndPermission> Handle(UpdateHoldMatchSettingRequest request, CancellationToken cancellationToken)
    {
        await settingService.ProcessUpdateHoldMatchSetting(request);

        var match = await settingService.GetRemarkInfo(request.MatchId);

        return new MatchAndPermission
        {
            Permission = permissionService.Permission,
            Match = match
        };
    }
}