namespace Settlement.Outright.Models;

public class LeagueMatch
{
    public List<Team> Teams { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName { get; set; }

    public bool? DeadHeat { get; set; }

    public bool IsCompleted { get; set; }

    public bool HighLight { get; set; }

    public DateTime EventDate { get; set; }

    public string SportName { get; set; }
}