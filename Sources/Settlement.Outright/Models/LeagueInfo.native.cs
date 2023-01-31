using Settlement.Core.Models;

namespace Settlement.Outright.Models;

public class LeagueInfo
{
    public IEnumerable<Team> Teams { get; set; }

    public string LeagueName { get; set; }

    public string SportName { get; set; }

    public Permission Permission { get; set; }

    public DateTime MoveBetsDay { get; set; }
}