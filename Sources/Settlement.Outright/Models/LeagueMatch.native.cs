namespace Settlement.Outright.Models;

public class LeagueMatch
{
    public List<Team> Teams { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName { get; set; }
}