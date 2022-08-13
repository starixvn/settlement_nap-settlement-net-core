using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class InstantCalculationRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public int InstantKey { get; set; }

        public string HomeScore { get; set; }

        public string AwayScore { get; set; }

        public bool IsHalfTime { get; set; }

        public string Action { get; set; }

        public bool IsExistHtFgNg { get; set; }

        public bool IsExistFgNg { get; set; }

        public string GoalRecord { get; set; }

        public string FirstGoalValue { get; set; }

        public int ChildMatchType { get; set; }

        public string Mode => IsHalfTime ? "INST-HT" : "INST-FT";
    }
}