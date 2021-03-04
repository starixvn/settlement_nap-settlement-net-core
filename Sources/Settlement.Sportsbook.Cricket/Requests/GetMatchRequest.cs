using MediatR;
using Settlement.Sportsbook.Cricket.Models;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class GetMatchRequest : IRequest<AioMatch>
    {
        public int MatchId { get; set; }

        public int SportType { get; set; }

        public string SettleType { get; set; }
    }
}