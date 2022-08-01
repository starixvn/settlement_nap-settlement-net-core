using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    public class EarlyHandler : IRequestHandler<GetMatchEarlyRequest, MatchEarly>
    {
        private readonly MatchEarlyService matchEarlyService;

        public EarlyHandler(MatchEarlyService matchEarlyService)
        {
            this.matchEarlyService = matchEarlyService;
        }

        public async Task<MatchEarly> Handle(GetMatchEarlyRequest request, CancellationToken cancellationToken)
        {
            return await matchEarlyService.GetMatch(request.MatchId);
        }
    }
}