using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Handlers
{
    public class CricketHandler :
            IRequestHandler<GetMatchRequest, Match>,
            IRequestHandler<SettleRequest, Result>
    {
        private readonly ICricketService cricketService;

        public CricketHandler(ICricketService cricketService)
        {
            this.cricketService = cricketService;
        }

        public async Task<Match> Handle(GetMatchRequest request, CancellationToken cancellationToken) => await cricketService.GetMatch(request);

        public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) => await cricketService.Settle(request);
    }
}
