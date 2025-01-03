using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Responses;

namespace Settlement.Setting.Handlers;

public class GetAutoSettleSettingsHandler(IDynamicRepository repository, IRefDataService refDataService)
    : IRequestHandler<AutoSettleSettingsQuery, GetAutoSettleSettingsResponse>
{
    public async Task<GetAutoSettleSettingsResponse> Handle(AutoSettleSettingsQuery query, CancellationToken cancellationToken)
    {
        var payoutCriteria = CreateSettingsSelCriteria(query);
        var payoutSetting = await repository.GetAsync<AutoSettleSetting>(payoutCriteria);

        var refundCriteria = CreateSettingsSelCriteria(query, 7);
        var refundSetting = await repository.GetAsync<AutoSettleSetting>(refundCriteria);

        var autoSettingBit = await GetAutoSettingBit(query.LeagueId, query.MatchId);
        var providers = (await repository.FetchAsync<ProviderInfo>(new GetProviderInfoCriteria
        {
            SportType = query.SportType,
            LeagueId = query.LeagueId
        })).ToList();

        return CreateGetSettingsResponse(query, payoutSetting, refundSetting, autoSettingBit, providers);
    }

    private bool IsBitSet(int value, int position) => (value & (1 << position)) != 0;

    private async Task<int> GetAutoSettingBit(int leagueId, int matchId)
    {
        var criteria = new GetSettingCriteria
        {
            MatchId = matchId,
            LeagueId = leagueId
        };
        var value = await repository.GetAsync<int?>(criteria);

        return value ?? 0;
    }

    private GetAutoSettleSettingsResponse CreateGetSettingsResponse(
        AutoSettleSettingsQuery query,
        AutoSettleSetting payoutSetting,
        AutoSettleSetting refundSetting,
        int autoSettingBit,
        List<ProviderInfo> providers)
    {
        var mainItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutMain - 1),
            ResourceType = ResourceType.Main,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = payoutSetting.Main_WaitingTime,
            MinProvider = payoutSetting.Main_NumberProvider,
            IsTraderRequired = payoutSetting.Main_HasTrader,
            Providers = GetProvidersSetting(
                payoutSetting.Main_PrimaryProvider ?? string.Empty,
                payoutSetting.Main_SecondaryProvider ?? string.Empty,
                payoutSetting.Main_InactiveProvider ?? string.Empty,
                providers)
        };

        var earlyItem = new GetAutoSettleSettingResponseItem
        {
            Enabled = IsBitSet(autoSettingBit, AutoSettleBitPosition.AutoPayoutEarly - 1),
            ResourceType = ResourceType.Early,
            SettleType = AutoSettleType.AutoPayout,
            WaitingTime = payoutSetting.EAR_WaitingTime,
            MinProvider = payoutSetting.EAR_NumberProvider,
            IsTraderRequired = payoutSetting.EAR_HasTrader,
            Providers = GetProvidersSetting(
                payoutSetting.EAR_PrimaryProvider ?? string.Empty,
                payoutSetting.EAR_SecondaryProvider ?? string.Empty,
                payoutSetting.EAR_InactiveProvider ?? string.Empty,
                providers)
        };

        var refundItem = new GetAutoSettleSettingResponseItem
        {
            ResourceType = ResourceType.Main,
            SettleType = AutoSettleType.AutoRefund,
            WaitingTime = refundSetting.Main_WaitingTime
        };

        return new GetAutoSettleSettingsResponse
        {
            LeagueId = query.LeagueId,
            MatchId = query.MatchId,
            TypeObject = query.TypeObject,
            LeagueName = refDataService.GetLeagueName(query.LeagueId),
            ResultSettings = [mainItem, earlyItem, refundItem]
        };
    }

    private static IGetSettingCriteria CreateSettingsSelCriteria(AutoSettleSettingsQuery query, byte AutoType = 6) => query.TypeObject == "League"
           ? new AutoSettleLeagueSettingSelCriteria
           {
               LeagueId = query.LeagueId,
               SportType = query.SportType,
               AutoType = AutoType
           }
           : new AutoSettleMatchSettingSelCriteria
           {
               LeagueId = query.LeagueId,
               MatchId = query.MatchId,
               SportType = query.SportType,
               AutoType = AutoType
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


