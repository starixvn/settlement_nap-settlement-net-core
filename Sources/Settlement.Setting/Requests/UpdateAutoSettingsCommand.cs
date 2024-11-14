using MediatR;
using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Requests;

public class UpdateAutoSettingsCommand : IRequest<Result>
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public string TypeObject { get; set; }
    public bool IsApplyAll { get; set; }
    public List<UpdateResultSettingItem> ResultSettings { get; set; }
    public List<UpdateResultSettingItem> OldResultSettings { get; set; }
}


public class UpdateResultSettingItem
{
    public AutoSettleType SettleType { get; set; }
    public ResourceType ResourceType { get; set; }
    public bool Enabled { get; set; }
    public int WaitingTime { get; set; }
    public bool IsTraderRequired { get; set; }
    public byte MinProvider { get; set; }
    public List<Provider> Providers { get; set; } = [];

    public string PrimaryProvider
        => string.Join(",", Providers.Where(x => x.IsActive && x.Priority == ProviderPriority.Primary).Select(x => x.SourceId));
    public byte? TotalPrimaryProvider
        => (byte)Providers.Count(x => x.IsActive && x.Priority == ProviderPriority.Primary);
    public string SecondaryProvider
        => string.Join(",", Providers.Where(x => x.IsActive && x.Priority == ProviderPriority.Secondary).Select(x => x.SourceId));
    public byte? TotalSecondaryProvider
        => (byte)Providers.Count(x => x.IsActive && x.Priority == ProviderPriority.Secondary);
    public string InactiveProvider
        => string.Join(",", Providers.Where(x => !x.IsActive).Select(x => x.SourceId));
}