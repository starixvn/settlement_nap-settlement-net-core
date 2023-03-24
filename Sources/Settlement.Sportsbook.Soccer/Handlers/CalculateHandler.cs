using MediatR;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.GetMatch;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Handlers;

public class CalculateHandler : IRequestHandler<GetMatchRequest, Match>,
    IRequestHandler<GetLatestMatchDetailRequest, MatchDetail>,
    IRequestHandler<SettleRequest, Result>,
    IRequestHandler<CheckStatusRequest, Result>,
    IRequestHandler<UndoCheckingRequest, UndoCheckingModel>,
    IRequestHandler<InstantCalculationRequest, Result>,
    IRequestHandler<MatchCheckingRequest, MatchGoalRecordModel>

{
    private readonly IMatchService matchService;

    private readonly ICalculateService calculateService;

    private readonly IInstantCalculateService instantCalculateService;

    public CalculateHandler(IMatchService matchService, ICalculateService calculateService,
        IInstantCalculateService instantCalculateService)
    {
        this.matchService = matchService;
        this.calculateService = calculateService;
        this.instantCalculateService = instantCalculateService;
    }

    public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        return request.IsRefundPage ? await matchService.GetMatchRefund(request) : await matchService.GetMatch(request);
    }

    public async Task<MatchDetail> Handle(GetLatestMatchDetailRequest request, CancellationToken cancellationToken) =>
        await matchService.GetLatestMatchDetail(request);

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken)
    {
        Console.WriteLine("Fanex.Settletment.WebSites(Handle): ");

        return request.ActionName.Equals(ActionType.UnCalculate)
            ? await calculateService.UnCalculate(request)
            : await calculateService.Calculate(request);
    }

    public async Task<Result> Handle(CheckStatusRequest request, CancellationToken cancellationToken) =>
        await calculateService.CheckStatus(request);

    public async Task<UndoCheckingModel> Handle(UndoCheckingRequest request, CancellationToken cancellationToken) =>
        await instantCalculateService.UndoCheckingScore(request.MatchId);

    public async Task<Result> Handle(InstantCalculationRequest request, CancellationToken cancellationToken) =>
        await instantCalculateService.PushInstantCalculation(request);

    public async Task<MatchGoalRecordModel> Handle(MatchCheckingRequest request, CancellationToken cancellationToken) =>
        await instantCalculateService.CalculateCheckingInfo(request);
}