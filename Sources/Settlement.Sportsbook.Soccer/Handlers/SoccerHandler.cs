using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    public class SoccerHandler : IRequestHandler<GetMatchRequest, Match>,
        IRequestHandler<GetLastestMatchDetailRequest, MatchDetail>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<CheckStatusRequest, Result>
    {
        private readonly IMatchService matchService;

        private readonly ICalculateService calculateService;

        public SoccerHandler(IMatchService matchService, ICalculateService calculateService)
        {
            this.matchService = matchService;
            this.calculateService = calculateService;
        }

        public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken) =>
            await matchService.GetMatch(request);

        public async Task<MatchDetail> Handle(GetLastestMatchDetailRequest request, CancellationToken cancellationToken) =>
            await matchService.GetLastestMatchDetail(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) =>
            await calculateService.Calculate(request);

        public async Task<Result> Handle(CheckStatusRequest request, CancellationToken cancellationToken) =>
            await calculateService.CheckStatus(request);
    }
}