namespace Settlement.Outright.Models;

public class DeadHeatSetting
{
    public int LeagueId { get; set; }

    public DateTime EventDate { get; set; }

    public byte? DeadHeat { get; set; }
}