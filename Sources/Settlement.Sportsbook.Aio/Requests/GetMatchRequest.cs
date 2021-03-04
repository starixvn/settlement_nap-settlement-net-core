using MediatR;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class GetMatchRequest : IRequest<AioMatch>
    {
        public int MatchId { get; set; }

        public string ApiKey { get; set; }

        public string SettleType { get; set; }

        public int SportType { get; set; }
    }
}