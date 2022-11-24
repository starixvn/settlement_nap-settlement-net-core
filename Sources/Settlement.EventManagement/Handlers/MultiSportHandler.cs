using Fanex.Logging;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;

namespace Settlement.EventManagement.Handlers;

public class MultiSportHandler : IRequestHandler<FilterMultiSportRequest, MultiSportModel>,
        IRequestHandler<LeagueRequest, List<LeagueTypeModel>>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<RefreshMultiSportRequest, IList<MultiSportMatchWaiting>>,
        IRequestHandler<CalculateParlayRequest, Result>
{
    private readonly IMultiSportService multiSportService;
    private readonly PermissionService permissionService;
    private readonly INapSession currentSession;
    private readonly IMapper mapper;
    private readonly GetDataFilterService getDataFilterService;

    public MultiSportHandler(
        IMultiSportService multiSportService,
        PermissionService permissionService,
        IMapper mapper,
        INapSession currentSession,
        GetDataFilterService getDataFilterService)
    {
        this.multiSportService = multiSportService;
        this.permissionService = permissionService;
        this.mapper = mapper;
        this.currentSession = currentSession;
        this.getDataFilterService = getDataFilterService;
    }

    public async Task<MultiSportModel> Handle(FilterMultiSportRequest request, CancellationToken cancellationToken)
    {
        var log = new Logger();
        var watch = System.Diagnostics.Stopwatch.StartNew();
        var Sports = await multiSportService.GetSportBook(request);
        watch.Stop();
        await log.InfoAsync($"DevLog: Total Time {watch.ElapsedMilliseconds} msec");

        return new MultiSportModel
        {
            Sports = Sports,
            Permission = permissionService.Permission
        };
    }

    public async Task<List<LeagueTypeModel>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeagues(request);

    public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSports(request);

    public async Task<IList<MultiSportMatchWaiting>> Handle(RefreshMultiSportRequest request, CancellationToken cancellationToken)
    {
        var list = await multiSportService.GetWaitingMatches(request);
        return mapper.Map<IList<Models.MultiSports.Match>, IList<MultiSportMatchWaiting>>(list);
    }

    public async Task<Result> Handle(CalculateParlayRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return await multiSportService.Calculate(request);
    }
}