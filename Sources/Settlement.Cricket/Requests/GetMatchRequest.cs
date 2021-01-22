using MediatR;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class GetMatchRequest : IRequest<Match>
    {
        public int MatchId { get; set; }

        public int SportType { get; set; }

        public string SettleType { get; set; }
    }
}
