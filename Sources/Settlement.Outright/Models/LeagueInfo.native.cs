using Settlement.Core.Models;

namespace Settlement.Outright.Models;

public class LeagueInfo
{
    public IEnumerable<Team> Teams { get; set; }

    public string LeagueName { get; set; }

    public Permission Permission { get; set; }
}