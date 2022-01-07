using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    public class SoccerHandler : IRequestHandler<GetMatchRequest, Match>,
        IRequestHandler<GetLastestMatchDetailRequest, MatchDetail>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<CheckStatusRequest, Result>,
        IRequestHandler<UndoCheckingRequest, UndoCheckingModel>,
        IRequestHandler<InstantCalculationRequest, Result>,
        IRequestHandler<MatchCheckingRequest, MatchGoalRecordModel>
    {
        private readonly IMatchService matchService;

        private readonly ICalculateService calculateService;

        private readonly IInstantCalculateService instantCalculateService;

        public SoccerHandler(IMatchService matchService, ICalculateService calculateService, IInstantCalculateService instantCalculateService)
        {
            this.matchService = matchService;
            this.calculateService = calculateService;
            this.instantCalculateService = instantCalculateService;
        }

        public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken) =>
            await matchService.GetMatch(request);

        public async Task<MatchDetail> Handle(GetLastestMatchDetailRequest request, CancellationToken cancellationToken) =>
            await matchService.GetLastestMatchDetail(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken)
        {
            return request.ActionName.Equals(ActionType.Uncalculate) ? await calculateService.UnCalculate(request) : await calculateService.Calculate(request);
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
}