using MediatR;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class MatchCheckingRequest : IRequest<MatchGoalRecordModel>
    {
        public int MatchId { get; set; }

        public int InstantKey { get; set; }

        public string HomeScore { get; set; }

        public string AwayScore { get; set; }

        public string Action { get; set; }

        public bool IsHalfTime { get; set; }

        public string Mode => IsHalfTime ? "INST-HT" : "INST-FT";
    }
}