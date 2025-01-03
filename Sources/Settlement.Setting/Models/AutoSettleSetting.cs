namespace Settlement.Setting.Models;

public class AutoSettleSetting
{
    public int LeagueId { get; set; }
    public int? MatchId { get; set; }
    public int Main_WaitingTime { get; set; }
    public bool Main_HasTrader { get; set; }
    public byte Main_NumberProvider { get; set; }
    public string Main_PrimaryProvider { get; set; }
    public int Main_TotalPrimaryProvider { get; set; }
    public string Main_SecondaryProvider { get; set; }

    public string Main_InactiveProvider { get; set; }
    public int EAR_WaitingTime { get; set; }
    public string EAR_InactiveProvider { get; set; }
    public bool EAR_HasTrader { get; set; }
    public byte EAR_NumberProvider { get; set; }
    public string EAR_PrimaryProvider { get; set; }
    public string EAR_SecondaryProvider { get; set; }
    public int EAR_TotalPrimaryProvider { get; set; }
}
