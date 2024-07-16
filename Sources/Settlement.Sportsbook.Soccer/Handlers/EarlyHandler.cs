using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers;

using Services.GetMatch;

public class EarlyHandler(
    INapSession currentSession,
    MatchEarlyService matchEarlyService,
    SettleEarlyService settleEarlyService)
    :
        IRequestHandler<GetMatchEarlyRequest, MatchEarly>,
        IRequestHandler<SettleEarlyRequest, Result>
{
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