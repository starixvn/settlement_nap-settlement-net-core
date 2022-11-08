using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class GetMatchRequest : IRequest<AioMatch>
    {
        public int MatchId { get; set; }

        public string ApiKey { get; set; }

        public string SettleType { get; set; }

        public Permission Permission { get; set; }
    }
}