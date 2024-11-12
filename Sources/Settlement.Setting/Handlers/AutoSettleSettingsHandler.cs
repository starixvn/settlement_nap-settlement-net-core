

using Fanex.Data.Repository;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
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
        ICriteria criteria = CreateAutoSettleSettingsSelCriteria(query);

        var result = await _repository.GetAsync<AutoSettleSetting>(criteria);

        var autoSettingBit = await GetAutoSettingBit(query.LeagueId, query.MatchId);

        var providers = await _repository.FetchAsync<ProviderInfo>(new GetProviderInfoCriteria
        {
            SportType = query.SportType,
            LeagueId = query.LeagueId
        });

        return CreateAutoSettleSettingsResponse(query, result, autoSettingBit, providers);

    }

    private bool IsBitSet(int value, int position)
    {
        return (value & (1 << position)) != 0;
    }

    public async Task<int> GetAutoSettingBit(int leagueId, int matchId)
    {
        var criteria = new GetSettingCriteria
        {
            MatchId = matchId,
            LeagueId = leagueId
        };

        var value = await _repository.GetAsync<int?>(criteria);

        return value ?? 0;
    }

    private GetAutoSettleSettingsResponse CreateAutoSettleSettingsResponse(
        AutoSettleSettingsQuery query,
        AutoSettleSetting result,
        int autoSettingBit,
        IEnumerable<ProviderInfo> providers)
    {
        var mainItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutMain - 1),
            ResourceType = ResourceType.Main,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = result.Main_WaitingTime,
            MinProvider = result.Main_NumberProvider,
            IsTraderRequired = result.Main_HasTrader,
            Providers = GetProvidersSetting(result.Main_PrimaryProvider, result.Main_SecondaryProvider, result.Main_InactiveProvider, providers)
        };

        var earlyItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutEarly - 1),
            ResourceType = ResourceType.Early,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = result.EAR_WaitingTime,
            MinProvider = result.EAR_NumberProvider,
            IsTraderRequired = result.EAR_HasTrader,
            Providers = GetProvidersSetting(result.EAR_PrimaryProvider, result.EAR_SecondaryProvider, result.EAR_InactiveProvider, providers)
        };


        return new GetAutoSettleSettingsResponse
        {
            LeagueId = query.LeagueId,
            MatchId = query.MatchId,
            TypeObject = query.TypeObject,
            ResultSettings = new List<GetAutoSettleSettingResponseItem> { mainItem, earlyItem }
        };
    }

    private static ICriteria CreateAutoSettleSettingsSelCriteria(AutoSettleSettingsQuery query)
    {
        return query.TypeObject == "League"
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
    }

    private List<Provider> GetProvidersSetting(
        string primaryProvider,
        string secondaryProvider,
        string activeProvider,
        IEnumerable<ProviderInfo> providerInfos)
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


