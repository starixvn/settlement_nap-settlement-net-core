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
        private readonly IMatchService matchService;

        public EarlyHandler(IMatchService matchService)
        {
            this.matchService = matchService;
        }

        public async Task<MatchEarly> Handle(GetMatchEarlyRequest request, CancellationToken cancellationToken)
        {
            return await matchService.GetMatchEarly(request.MatchId);
        }
    }
}