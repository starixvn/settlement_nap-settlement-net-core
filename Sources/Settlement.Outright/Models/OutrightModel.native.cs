namespace Settlement.Outright.Models;

public class OutrightModel
{
    public string SportName { get; set; }

    public IEnumerable<LeagueMatch> LeagueMatch { get; set; }
}