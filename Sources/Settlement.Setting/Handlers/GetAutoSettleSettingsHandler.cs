

using Fanex.Data.Repository;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Handlers;

public class GetAutoSettleSettingsHandler
{
    private readonly IDynamicRepository _repository;

    public GetAutoSettleSettingsHandler(IDynamicRepository repository)
    {
        _repository = repository;
    }


    public async Task<GetAutoSettleSettingsResponse> HandleAsync(AutoSettleSettingsQuery query, CancellationToken cancellationToken)
    {
        ICriteria criteria = CreateSettingsSelCriteria(query);

        var result = await _repository.GetAsync<AutoSettleSetting>(criteria);

        var autoSettingBit = await GetAutoSettingBit(query.LeagueId, query.MatchId);

        var providers = await _repository.FetchAsync<ProviderInfo>(new GetProviderInfoCriteria
        {
            SportType = query.SportType,
            LeagueId = query.LeagueId
        });

        return CreateGetSettingsResponse(query, result, autoSettingBit, providers);

    }

    private bool IsBitSet(int value, int position) => (value & (1 << position)) != 0;

    private async Task<int> GetAutoSettingBit(int leagueId, int matchId)
    {
        var criteria = new GetSettingCriteria
        {
            MatchId = matchId,
            LeagueId = leagueId
        };

        var value = await _repository.GetAsync<int?>(criteria);

        return value ?? 0;
    }

    private GetAutoSettleSettingsResponse CreateGetSettingsResponse(
        AutoSettleSettingsQuery query,
        AutoSettleSetting setting,
        int autoSettingBit,
        IEnumerable<ProviderInfo> providers)
    {
        var mainItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutMain - 1),
            ResourceType = ResourceType.Main,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = setting.Main_WaitingTime,
            MinProvider = setting.Main_NumberProvider,
            IsTraderRequired = setting.Main_HasTrader,
            Providers = GetProvidersSetting(setting.Main_PrimaryProvider, setting.Main_SecondaryProvider, setting.Main_InactiveProvider, providers)
        };

        var earlyItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutEarly - 1),
            ResourceType = ResourceType.Early,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = setting.EAR_WaitingTime,
            MinProvider = setting.EAR_NumberProvider,
            IsTraderRequired = setting.EAR_HasTrader,
            Providers = GetProvidersSetting(setting.EAR_PrimaryProvider, setting.EAR_SecondaryProvider, setting.EAR_InactiveProvider, providers)
        };

        return new GetAutoSettleSettingsResponse
        {
            LeagueId = query.LeagueId,
            MatchId = query.MatchId,
            TypeObject = query.TypeObject,
            ResultSettings = new List<GetAutoSettleSettingResponseItem> { mainItem, earlyItem }
        };
    }

    private static ICriteria CreateSettingsSelCriteria(AutoSettleSettingsQuery query) => query.TypeObject == "League"
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

    private List<Provider> GetProvidersSetting(
        string primaryProvider,
        string secondaryProvider,
        string activeProvider,
        IEnumerable<ProviderInfo> providersInfo)
    {
        var primaryProviderIds = primaryProvider.Split(','); // 1,2,3
        var secondaryProviderIds = secondaryProvider.Split(','); // 1,2
        var activeProviderIds = activeProvider.Split(','); // 2,3


        var result = providersInfo.Select(x => new Provider
        {
            SourceId = x.SourceId,
            SourceName = x.SourceName,
            Priority = GetProviderPriority(x.SourceId, primaryProviderIds, secondaryProviderIds),
            IsActive = !activeProviderIds.Contains(x.SourceId.ToString())
        }).ToList();


        return result;
    }

    private ProviderPriority GetProviderPriority(int sourceId, string[] primaryProviderIds, string[] secondaryProviderIds)
    {
        var sourceIdStr = sourceId.ToString();

        return sourceIdStr switch
        {
            _ when primaryProviderIds.Contains(sourceIdStr) => ProviderPriority.Primary,
            _ when secondaryProviderIds.Contains(sourceIdStr) => ProviderPriority.Secondary,
            _ => ProviderPriority.UnAssign
        };
    }
}


