using Fanex.NAP.Client.Helpers.Web;
using MediatR;
using Settlement.Models;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.Happy5;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Services.Happy5;

namespace Settlement.Gaming.Handlers;

public class Happy5Handler(
    INapSession currentSession,
    BallService ballService,
    LeagueService leagueService,
    PermissionService permissionService,
    SettlementService settlementService)
    :
        IRequestHandler<Happy5BallsRequest, List<BallModel>>,
        IRequestHandler<Happy5MatchRequest, HappyFive>,
        IRequestHandler<Happy5SettlementRequest, Result>
{
    public async Task<List<BallModel>> Handle(Happy5BallsRequest request, CancellationToken cancellationToken)
        => await ballService.GetBallsByMatchId(request.MatchId);

    public async Task<HappyFive> Handle(Happy5MatchRequest request, CancellationToken cancellationToken)
    {
        return new HappyFive
        {
            Permission = permissionService.Permission,
            Leagues = await leagueService.Search(request)
        };
    }

    public async Task<Result> Handle(Happy5SettlementRequest request, CancellationToken cancellationToken)
    {
        request.UserId = currentSession.UserId;
        request.Permission = permissionService.Permission;
        return await settlementService.Settle(request);
    }
}