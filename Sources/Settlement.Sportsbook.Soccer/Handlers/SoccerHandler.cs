using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers
{
    public class SoccerHandler : IRequestHandler<GetMatchRequest, Match>
    {
        private readonly IGetMatchService getMatchService;

        public SoccerHandler(IGetMatchService getMatchService)
        {
            this.getMatchService = getMatchService;
        }

        public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken) =>
            await getMatchService.GetMatch(request);
    }
}