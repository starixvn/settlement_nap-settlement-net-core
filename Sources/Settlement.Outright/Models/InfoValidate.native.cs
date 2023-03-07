namespace Settlement.Outright.Models;

public class InfoValidate
{
	public InfoValidate(string matchId, string teamId, DateTime? eventDate = null)
	{
		EventDate = eventDate;
		MatchId = matchId;
		TeamId = teamId;
	}

	public string MatchId { get; set; }

	public string TeamId { get; set; }

	public DateTime? EventDate { get; set; }
}