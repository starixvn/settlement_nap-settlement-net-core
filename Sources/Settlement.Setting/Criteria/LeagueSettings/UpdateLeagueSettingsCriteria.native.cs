using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.LeagueSettings;
public class UpdateLeagueSettingsCriteria : NonQueryCommand
{
    public int LeagueId { get; set; }

    public byte AutoType { get; set; } = 6;

    public int RetryTime { get; set; }

    public bool Main_HasTrader { get; set; }

    public byte Main_NumberProvider { get; set; }

    public string Main_PrimaryProvider { get; set; }

    public int Main_TotalPrimaryProvider => Main_PrimaryProvider.Split(',', StringSplitOptions.RemoveEmptyEntries).Length;

    public string Main_SecondaryProvider { get; set; }

    public int Main_TotalSecondaryProvider => Main_SecondaryProvider.Split(',', StringSplitOptions.RemoveEmptyEntries).Length;

    public bool EAR_HasTrader { get; set; }

    public byte EAR_NumberProvider { get; set; }

    public string EAR_PrimaryProvider { get; set; }

    public int EAR_TotalPrimaryProvider => EAR_PrimaryProvider.Split(',', StringSplitOptions.RemoveEmptyEntries).Length;

    public string EAR_SecondaryProvider { get; set; }

    public int EAR_TotalSecondaryProvider => EAR_SecondaryProvider.Split(',', StringSplitOptions.RemoveEmptyEntries).Length;

    public override string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Update";

    public override bool IsValid() => LeagueId > 0;
}
