namespace Settlement.Outright.Models;

public class TeamSettleModel
{
    public int MatchId { get; set; }

    public string teamId { get; set; }

    public string Status { get; set; }

    public bool IsDeadheat { get; set; }

    public DateTime EventDate { get; set; }
}