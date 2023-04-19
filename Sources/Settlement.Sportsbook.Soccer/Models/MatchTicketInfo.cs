namespace Settlement.Sportsbook.Soccer.Models;
public class MatchTicketInfo
{
    public bool IsExistHtFgNg { get; set; }
    public bool IsExistFgNg { get; set; }
    public bool IsExistFG { get; set; }
    public bool IsExistHTFG { get; set; }
    public bool IsExistCorner { get; set; }
    public bool IsExistHTCorner { get; set; }
    public bool IsExistFirstCorner { get; set; }
    public bool IsExistHTFirstCorner { get; set; }
    public bool IsExist2HFirstCorner { get; set; }
    public bool IsHalfTime { get; set; }

    public string GoalRecord { get; set; }

    public string BetStatus { get; set; }
}
