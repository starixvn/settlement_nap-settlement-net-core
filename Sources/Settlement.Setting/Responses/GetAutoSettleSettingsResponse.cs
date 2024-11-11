using Settlement.Setting.Constants;

namespace Settlement.Setting.Responses;

public class GetAutoSettleSettingResponseItem
{
    public AutoSettleType SettleType { get; set; } // "Payout" | "Refund"
    public ResourceType ResourceType { get; set; } // "Main" | "Early"
    public bool Enabled { get; set; }
    public int WaitingTime { get; set; }
    public bool IsTraderRequired { get; set; }
    public byte MinProvider { get; set; }
    public List<Provider> Providers { get; set; }

    public string PrimaryProvider => string.Join(",", Providers.Where(p => p.Priority == ProviderPriority.Primary).Select(p => p.SourceName));
    public string SecondaryProvider => string.Join(",", Providers.Where(p => p.Priority == ProviderPriority.Secondary).Select(p => p.SourceName));
}


public class Provider
{
    public int SourceId { get; set; }
    public string SourceName { get; set; }
    public ProviderPriority Priority { get; set; } // 1: Primary, 2: Secondary, 0: Other
    public bool IsActive { get; set; }
}


public class GetAutoSettleSettingsResponse
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public string MatchName { get; set; }
    public string LeagueName { get; set; }
    public string TypeObject { get; set; } // "League" hoặc "Match"

    public List<GetAutoSettleSettingResponseItem> ResultSettings { get; set; }
}
