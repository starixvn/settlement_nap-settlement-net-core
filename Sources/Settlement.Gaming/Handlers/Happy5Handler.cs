using MediatR;
using Settlement.Gaming.Services.Happy5;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using Settlement.Gaming.Models;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Models.Happy5;
using Settlement.Core.Models;

namespace Settlement.Gaming.Handlers;

public class Happy5Handler : 
    IRequestHandler<Happy5BallsRequest, List<BallModel>>,
    IRequestHandler<Happy5MatchRequest, HappyFive>,
    IRequestHandler<Happy5SettlementRequest, Result>
{
    private readonly BallService ballService;

    private readonly LeagueService leagueService;

    private readonly PermissionService permissionService;

    private readonly SettlementService settlementService;

    public Happy5Handler(
        BallService ballService,
        LeagueService leagueService,
        PermissionService permissionService,
        SettlementService settlementService)
    {
        this.ballService = ballService;
        this.leagueService = leagueService;
        this.permissionService = permissionService;
        this.settlementService = settlementService;
    }

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
        request.Permission = permissionService.Permission;
        return await settlementService.Settle(request);
    }
}