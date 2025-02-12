namespace Settlement.Gaming.Models.Happy5;

public class LeaguesModel
{
    public int LeagueId { get; set; }

    public string LeagueName { get; set; }

    public List<MatchDetail> Matches { get; set; }
}