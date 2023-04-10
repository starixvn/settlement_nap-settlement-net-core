namespace Settlement.Gaming.Models.NumberGame;

public class MatchDetailModel
{
    public string BetStatus { get; set; }

    public int LeagueId { get; set; }

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public DateTime EventDate { get; set; }

    public string EventName => $"Number Game No {MatchCode}";

    public DateTime KickOffTime { get; set; }

    public string EventStatus { get; set; }

    public string Number { get; set; }

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