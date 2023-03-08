namespace Settlement.Gaming.Models.Happy5;

public class MatchDetail
{
    private const string Refund = "Refund";
    private string eventStatus = string.Empty;

    public int MatchId { get; set; }

    public int LeagueId { get; set; }

    public string MatchCode { get; set; }

    public DateTime KickOffTime { get; set; }

    public DateTime EventDate { get; set; }

    public string EventName => $"No {MatchCode}";

    public string EventStatus
    {
        get
        {
            if (BetStatus.IgnoreCaseContains(Refund))
            {
                eventStatus = Refund;
            }

            return eventStatus;
        }
        set => eventStatus = value;
    }

    public string BetStatus { get; set; }

    public List<BallModel> Balls { get; set; }

    public bool IsYesterdayMatch
    {
        get
        {
            const int twoDays = 2;
            var start = Convert.ToDateTime(EventDate.ToShortDateString());
            var end = Convert.ToDateTime(DateTime.Now.ToShortDateString());
            var totalDays = end.Subtract(start).TotalDays;

            return totalDays < twoDays;
        }
    }
}