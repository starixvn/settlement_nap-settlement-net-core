

using Fanex.Data.Repository;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Handlers;

public class AutoSettleSettingsHandler
{
    private readonly IDynamicRepository _repository;

    public AutoSettleSettingsHandler(IDynamicRepository repository)
    {
        _repository = repository;
    }


    public async Task<GetAutoSettleSettingsResponse> HandleAsync(AutoSettleSettingsQuery query, CancellationToken cancellationToken)
    {
        ICriteria criteria = query.TypeObject == "League"
           ? new AutoSettleLeagueSettingSelCriteria
           {
               LeagueId = query.LeagueId,
               SportType = query.SportType
           }
           : new AutoSettleMatchSettingSelCriteria
           {
               LeagueId = query.LeagueId,
               MatchId = query.MatchId,
               SportType = query.SportType
           };

        var result = await _repository.GetAsync<AutoSettleSetting>(criteria);

        var providers = await _repository.FetchAsync<ProviderInfo>(new GetProviderInfoCriteria
        {
            SportType = query.SportType,
            LeagueId = query.LeagueId
        });

        var mainItem = new GetAutoSettleSettingResponseItem
        {
            TypeResult = "Main",
            TypeSettle = "Payout",
            WaitingTime = result.Main_WaitingTime,
            MinProvider = result.Main_NumberProvider,
            IsTraderRequired = result.Main_HasTrader,
            Providers = GetProvidersSetting(result.Main_PrimaryProvider, result.Main_SecondaryProvider, result.Main_InactiveProvider, providers.ToList())
        };

        var earlyItem = new GetAutoSettleSettingResponseItem
        {
            TypeResult = "Early",
            TypeSettle = "Payout",
            WaitingTime = result.EAR_WaitingTime,
            MinProvider = result.EAR_NumberProvider,
            IsTraderRequired = result.EAR_HasTrader,
            Providers = GetProvidersSetting(result.EAR_PrimaryProvider, result.EAR_SecondaryProvider, result.EAR_InactiveProvider, providers.ToList())
        };

        return new GetAutoSettleSettingsResponse
        {
            LeagueId = query.LeagueId,
            MatchId = query.MatchId,
            ResultSettings = new List<GetAutoSettleSettingResponseItem> { mainItem, earlyItem }
        };

    }

    private List<Provider> GetProvidersSetting(
        string primaryProvider,
        string secondaryProvider,
        string activeProvider,
        List<ProviderInfo> providerInfos)
    {
        var primaryProviderIds = primaryProvider.Split(','); // 1,2,3
        var secondaryProviderIds = secondaryProvider.Split(','); // 1,2
        var activeProviderIds = activeProvider.Split(','); // 2,3


        var result = providerInfos.Select(x => new Provider
        {
            SourceId = x.SourceId,
            SourceName = x.SourceName,
            Priority = GetProviderPriority(x.SourceId, primaryProviderIds, secondaryProviderIds),
            IsActive = !activeProviderIds.Contains(x.SourceId.ToString())
        }).ToList();


        return result;
    }

    private int GetProviderPriority(int sourceId, string[] primaryProviderIds, string[] secondaryProviderIds)
    {
        var sourceIdStr = sourceId.ToString();

        return sourceIdStr switch
        {
            _ when primaryProviderIds.Contains(sourceIdStr) => 1,
            _ when secondaryProviderIds.Contains(sourceIdStr) => 2,
            _ => 0
        };
    }
}


public class AutoSettleMatchSettingSelCriteria : ICriteria

{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey() => "NAP_Set_AutoPayout_MatchSetting_Sel";

    public bool IsValid() => true;
}

public class AutoSettleLeagueSettingSelCriteria : ICriteria
{
    public int LeagueId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Sel";

    public bool IsValid() => true;
}
