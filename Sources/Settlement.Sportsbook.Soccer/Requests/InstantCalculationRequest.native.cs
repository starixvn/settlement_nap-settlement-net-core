using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class InstantCalculationRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public int InstantKey { get; set; }

    public string HomeScore { get; set; }

    public string AwayScore { get; set; }

    public bool IsHalfTime { get; set; }

    public string Action { get; set; }

    public bool IsExistHtFgNg { get; set; }

    public bool IsExistFgNg { get; set; }

    public bool IsExistFG { get; set; }

    public bool IsExistHTFG { get; set; }

    public bool IsExistCorner { get; set; }

    public bool IsExistHTCorner { get; set; }

    public bool IsExistFirstCorner { get; set; }

    public bool IsExistHTFirstCorner { get; set; }

    public bool IsExist2HFirstCorner { get; set; }

    public string GoalRecord { get; set; }

    public string FirstGoalValue { get; set; }

    public int ChildMatchType { get; set; }

    public string BetStatus { get; set; }

    public string Mode => IsHalfTime ? "INST-HT" : "INST-FT";

    public List<XmlResource> Resources { get; set; }
}