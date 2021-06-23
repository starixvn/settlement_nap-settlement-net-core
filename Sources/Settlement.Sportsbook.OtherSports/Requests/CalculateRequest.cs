using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.Requests
{
    public class CalculateRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string FinalHomeScore { get; set; }

        public string FinalAwayScore { get; set; }

        public string BetStatus { get; set; }

        public string Action { get; set; }

        public bool IsReSettledTickets { get; set; }
    }
}