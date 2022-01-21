using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class RefundRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }

        public int? HalfTimeHome { get; set; }

        public int? HalfTimeAway { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public string BetStatus { get; set; }

        public byte SDTRecord { get; set; }

        public string GoalRecord { get; set; }

        public bool IsApplyHedging { get; set; }

        public int HedgeMatchId { get; set; }
    }
}