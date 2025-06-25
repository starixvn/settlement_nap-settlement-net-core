using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.GetMatch;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Handlers;

public class CalculateHandler(
    INapSession currentSession,
    IMatchService matchService,
    ICalculateService calculateService,
    InstantCalculateService instantCalculateService,
    IFetchDataService fetchDataService)
    : IRequestHandler<GetMatchRequest, Match>,
        IRequestHandler<GetLatestMatchDetailRequest, MatchDetail>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<CheckStatusRequest, Result>,
        IRequestHandler<UndoCheckingRequest, UndoCheckingModel>,
        IRequestHandler<InstantCalculationRequest, Result>,
        IRequestHandler<UncalculateFtRequest, Result>,
        IRequestHandler<GetResultDetailRequest, IEnumerable<ResultDetail>>,
        IRequestHandler<SaveScoreRequest, Result>,
        IRequestHandler<CountTicketsRequest, CountTicketResponse>,
        IRequestHandler<SaveOutsideScoreRequest, Result>

{
    public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        return request.IsRefundPage ? await matchService.GetMatchRefund(request) : await matchService.GetMatch(request);
    }

    public async Task<MatchDetail> Handle(GetLatestMatchDetailRequest request, CancellationToken cancellationToken) =>
        await matchService.GetLatestMatchDetail(request);

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return request.ActionName.Equals(ActionType.UnCalculate)
            ? await calculateService.UnCalculate(request)
            : await calculateService.Calculate(request);
    }

    public async Task<Result> Handle(CheckStatusRequest request, CancellationToken cancellationToken) =>
        await calculateService.CheckStatus(request);

    public async Task<Result> Handle(UncalculateFtRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return await calculateService.UncalculateFt(request);
    }

    public async Task<UndoCheckingModel> Handle(UndoCheckingRequest request, CancellationToken cancellationToken) =>
        await instantCalculateService.UndoCheckingScore(request.MatchId);

    public async Task<Result> Handle(InstantCalculationRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return request.Action.Equals(ActionType.UnCalculate)
            ? await instantCalculateService.UncalPushInstantCalculation(request)
            : await instantCalculateService.PushInstantCalculation(request);
    }

    public async Task<IEnumerable<ResultDetail>> Handle(GetResultDetailRequest request, CancellationToken cancellationToken)
    {
        return await matchService.GetResultDetail(request.MatchId);
    }

    public async Task<Result> Handle(SaveScoreRequest request, CancellationToken cancellationToken)
    {
        return await calculateService.SaveScore(request);
    }

    public async Task<CountTicketResponse> Handle(CountTicketsRequest request, CancellationToken cancellationToken)
        => await fetchDataService.CountTickets(request.MatchId);

    public async Task<Result> Handle(SaveOutsideScoreRequest request, CancellationToken cancellationToken)
    {
        return await calculateService.SaveOutsideScore(request);
    }
}