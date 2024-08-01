namespace Settlement.Outright.Models;

public class InfoValidate(string matchId, string teamId, DateTime? eventDate = null)
{
    public string MatchId { get; set; } = matchId;

    public string TeamId { get; set; } = teamId;

    public DateTime? EventDate { get; set; } = eventDate;
}