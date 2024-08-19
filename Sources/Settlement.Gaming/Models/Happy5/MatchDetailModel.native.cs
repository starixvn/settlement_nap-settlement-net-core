namespace Settlement.Gaming.Models.Happy5;

public class MatchDetail
{
    public int MatchId { get; set; }

    public int LeagueId { get; set; }

    public string MatchCode { get; set; }

    public DateTime KickOffTime { get; set; }

    public DateTime EventDate { get; set; }

    public string EventName { get; set; }

    public string EventStatus { get; set; }

    public string BetStatus { get; set; }

    public List<BallModel> Balls { get; set; }

    public bool IsYesterdayMatch { get; set; }
}