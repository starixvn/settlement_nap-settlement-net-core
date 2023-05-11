using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.Calculation;

[MessagePackObject]
public class CalculationLeagues
{
    [Key("permission")]
    public Permission Permission { get; set; }

    [Key("leagues")]
    public List<League> Leagues { get; set; }
}