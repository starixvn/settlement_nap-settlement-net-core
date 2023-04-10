namespace Settlement.Core.Models;

public class ReferenceAction
{
    public int MatchId { get; set; }

    public int ActionId { get; set; }

    public bool IsFailed { get; set; }

    public string HomeScore { get; set; }

    public string AwayScore { get; set; }

    public DateTime LogDate { get; set; }
}