using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.GetMatch.Services;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    public class EarlyHandler : IRequestHandler<GetMatchEarlyRequest, MatchEarly>, IRequestHandler<SettleEarlyRequest, Result>
    {
        private readonly MatchEarlyService matchEarlyService;

        private readonly SettleEarlyService settleEarlyService;

        public EarlyHandler(MatchEarlyService matchEarlyService, SettleEarlyService settleEarlyService)
        {
            this.matchEarlyService = matchEarlyService;
            this.settleEarlyService = settleEarlyService;
        }

        public async Task<MatchEarly> Handle(GetMatchEarlyRequest request, CancellationToken cancellationToken)
        {
            return await matchEarlyService.GetMatch(request.MatchId);
        }

        public async Task<Result> Handle(SettleEarlyRequest request, CancellationToken cancellationToken)
        {
            return await settleEarlyService.CalculateEarly(request);
        }
    }
}