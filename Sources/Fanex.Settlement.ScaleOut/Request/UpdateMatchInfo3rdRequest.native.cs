namespace Fanex.Settlement.ScaleOut.Request;

public class UpdateMatchInfo3RdRequest
{
    public int MatchId { get; set; }

    public int Creator { get; set; }

    public string Command { get; set; }

    public string Action { get; set; }

    public int? FTHome { get; set; }

    public int? FTAway { get; set; }

    public string BetStatus { get; set; }
}