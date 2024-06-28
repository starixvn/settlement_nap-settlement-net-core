using Settlement.Models;

namespace Settlement.Outright.Models;

public class SportLeague
{
    public IEnumerable<Sport> Sports { get; set; }

    public IEnumerable<League> Leagues { get; set; }
}