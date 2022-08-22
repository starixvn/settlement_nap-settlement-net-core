using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.Requests
{
    public class RefundRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public int HedgeMatchId { get; set; }
    }
}