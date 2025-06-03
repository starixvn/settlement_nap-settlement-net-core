using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using MediatR;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;

namespace Settlement.ThirdPartyProducts.Handlers;

public class BetBuilderHandler(
    MatchService matchService,
    PermissionService permissionService,
    BetBuilderService betBuilderService,
    BetBuilderMatchesService betBuilderMatchesService,
    BetBuilderCalculateService calculateService,
    IPublishEndpoint publishEndpoint)
    : IRequestHandler<FilterRequest, MultiSportsModel>,
        IRequestHandler<SportRequest, List<Sport>>,
        IRequestHandler<GetSelectionRequest, SelectionPermissionModel>,
        IRequestHandler<LeaguesRequest, List<LeagueTypeModel>>,
        IRequestHandler<MatchesWaitingRequest, List<MatchDetailModel>>,
        IRequestHandler<MatchInfoRequest, MatchDetailModel>,
        IRequestHandler<CalculateRequest, Result>
{
    public async Task<MultiSportsModel> Handle(FilterRequest request, CancellationToken cancellationToken) => new()
    {
        SportLeagues = await betBuilderMatchesService.Search(request),
        Permission = permissionService.Permission
    };

    public async Task<SelectionPermissionModel> Handle(GetSelectionRequest request, CancellationToken cancellationToken) => new()
    {
        Permission = permissionService.Permission,
        SelectionDetail = await matchService.GetSelection(request.MatchId)
    };

    public async Task<List<Sport>> Handle(SportRequest request, CancellationToken cancellationToken)
        => await betBuilderService.GetSports(request);

    public async Task<List<LeagueTypeModel>> Handle(LeaguesRequest request, CancellationToken cancellationToken)
        => await betBuilderService.GetLeagues(request);

    public async Task<List<MatchDetailModel>> Handle(MatchesWaitingRequest request, CancellationToken cancellationToken)
        => await betBuilderMatchesService.RefreshMatches(request);

    public async Task<MatchDetailModel> Handle(MatchInfoRequest request, CancellationToken cancellationToken)
        => await matchService.GetMatch(request);

    public async Task<Result> Handle(CalculateRequest request, CancellationToken cancellationToken)
    {
        var result = await calculateService.Calculate(request);
        if (result.HasResultAmendment)
        {
            await publishEndpoint.Publish(
            new ResultAmendSettled(request.MatchId, result.SettledSessionId, result.IsOrg),
    new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }
        return result;
    }
}