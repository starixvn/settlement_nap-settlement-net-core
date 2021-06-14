using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Models;

namespace Settlement.Sportsbook.OtherSports.Requests
{
    public class GetMatchRequest : IRequest<OtherSportsMatchModel>
    {
        public int MatchId { get; set; }

        public bool IsRefundPage { get; set; }
    }
}