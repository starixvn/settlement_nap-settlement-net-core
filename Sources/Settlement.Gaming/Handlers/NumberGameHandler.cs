using Fanex.NAP.Client.Helpers.Web;
using MediatR;
using Settlement.Core.Models;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Services.NumberGame;

namespace Settlement.Gaming.Handlers;

public class NumberGameHandler :
    IRequestHandler<NumberGameBallsRequest, List<BallModel>>,
    IRequestHandler<NumberGameMatchRequest, NumberGameModel>,
    IRequestHandler<NumberGameSettlementRequest, Result>
{
    private readonly INapSession currentSession;

    private readonly MatchService matchService;

    private readonly LeagueService leagueService;

    private readonly PermissionService permissionService;

    private readonly SettlementService settlementService;

    public NumberGameHandler(
        INapSession currentSession,
        MatchService matchService,
        LeagueService leagueService,
        PermissionService permissionService,
        SettlementService settlementService)
    {
        this.currentSession = currentSession;
        this.matchService = matchService;
        this.leagueService = leagueService;
        this.permissionService = permissionService;
        this.settlementService = settlementService;
    }

    public async Task<List<BallModel>> Handle(NumberGameBallsRequest request, CancellationToken cancellationToken)
        => await matchService.Balls(request);

    public async Task<NumberGameModel> Handle(NumberGameMatchRequest request, CancellationToken cancellationToken)
    {
        return new NumberGameModel
        {
            Permission = permissionService.Permission,
            Leagues = await leagueService.Search(request)
        };
    }

    public async Task<Result> Handle(NumberGameSettlementRequest request, CancellationToken cancellationToken)
    {
        request.UserId = currentSession.UserId;
        request.Permission = permissionService.Permission;
        return await settlementService.Settle(request);
    }
}