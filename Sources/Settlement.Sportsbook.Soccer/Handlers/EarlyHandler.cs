using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers;

using Fanex.NAP.Client.Helpers.Web;
using Services.GetMatch;

public class EarlyHandler :
    IRequestHandler<GetMatchEarlyRequest, MatchEarly>,
    IRequestHandler<SettleEarlyRequest, Result>
{
    private readonly INapSession currentSession;

    private readonly MatchEarlyService matchEarlyService;

    private readonly SettleEarlyService settleEarlyService;

    public EarlyHandler(
        INapSession currentSession,
        MatchEarlyService matchEarlyService,
        SettleEarlyService settleEarlyService)
    {
        this.currentSession = currentSession;
        this.matchEarlyService = matchEarlyService;
        this.settleEarlyService = settleEarlyService;
    }

    public async Task<MatchEarly> Handle(GetMatchEarlyRequest request, CancellationToken cancellationToken)
    {
        return await matchEarlyService.GetMatch(request.MatchId);
    }

    public async Task<Result> Handle(SettleEarlyRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return await settleEarlyService.CalculateEarly(request);
    }
}