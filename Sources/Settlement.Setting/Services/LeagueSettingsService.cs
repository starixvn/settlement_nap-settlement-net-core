using AutoMapper;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Helpers;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.LeagueSettings;

namespace Settlement.Setting.Services;

public interface LeagueSettingsService
{
    public Task<AutoSettings> GetLeagueSettings(GetLeagueSettingsRequest request);

    public Task<Result> UpdateLeagueSettings(UpdateLeagueSettingsRequest request);
}

public class LeagueSettingsServiceImp(IDynamicRepository repository,
        IMapper mapper,
        LogService logService,
        SettingService settingService)
    : LeagueSettingsService
{
    private const int ActionChangeLeagueSettingsId = 81048;

    private const int DirectSetting = 5;

    private const int RefundSetting = 7;

    public async Task<AutoSettings> GetLeagueSettings(GetLeagueSettingsRequest request)
    {
        var leagueSettings = await settingService.GetLeagueSettings(request);
        return new AutoSettings
        {
            LeagueId = leagueSettings.LeagueId,
            LeagueName = leagueSettings.LeagueName,
            Providers = leagueSettings.Providers,
            MainResultSettings = GetMainResultSettings(leagueSettings),
            EarlyResultSettings = GetEarlyResultSettings(leagueSettings)
        };
    }

    private static ResultSettings GetMainResultSettings(LeagueSettings leagueSettings)
    {
        return new ResultSettings
        {
            HasTrader = leagueSettings.Main_HasTrader,
            MinimumProvider = leagueSettings.Main_NumberProvider,
            WaitingTime = leagueSettings.Main_WaitingTime,
            SecondaryProvider = ParseProvider(leagueSettings.Main_SecondaryProvider, leagueSettings.Providers),
            PrimaryProvider = ParseProvider(leagueSettings.Main_PrimaryProvider, leagueSettings.Providers),
            InactiveProvider = leagueSettings.Main_InactiveProvider
        };
    }

    private static ResultSettings GetEarlyResultSettings(LeagueSettings leagueSettings)
    {
        return new ResultSettings
        {
            HasTrader = leagueSettings.EAR_HasTrader,
            MinimumProvider = leagueSettings.EAR_NumberProvider,
            WaitingTime = leagueSettings.EAR_WaitingTime,
            SecondaryProvider = ParseProvider(leagueSettings.EAR_SecondaryProvider, leagueSettings.Providers),
            PrimaryProvider = ParseProvider(leagueSettings.EAR_PrimaryProvider, leagueSettings.Providers),
            InactiveProvider = leagueSettings.EAR_InactiveProvider
        };
    }

    private static string ParseProvider(string providers, IEnumerable<ProviderInfo> providerInfos)
    {
        var providerIds = providers.Split(',');
        var providerNames = providerInfos.Where(p => providerIds.Contains(p.SourceId.ToString()))
            .Select(p => p.SourceName);

        return string.Join(", ", providerNames);
    }

    public async Task<Result> UpdateLeagueSettings(UpdateLeagueSettingsRequest request)
    {
        var oldSettings = mapper.Map<UpdateLeagueSettingsCriteria>(request.OldSettings);
        var newSettings = mapper.Map<UpdateLeagueSettingsCriteria>(request.NewSettings);
        var logDifferentProp = LeagueSettingsHelper.FindDifferentProperties(oldSettings, newSettings);

        await repository.ExecuteAsync(newSettings);

        var updateWTResult = await UpdateWaitingTime(request);

        var updateASResult = await UpdateAutoSetting(request);

        if (!string.IsNullOrEmpty(logDifferentProp))
        {
            await logService.WriteLog(logDifferentProp, ActionChangeLeagueSettingsId);
        }

        return updateASResult.ErrCode + updateWTResult.ErrCode > 0 ? new Result(1, $"{updateWTResult.ErrMsg}<br/>{updateASResult.ErrMsg}") : new Result();
    }

    private async Task<Result> UpdateWaitingTime(UpdateLeagueSettingsRequest request)
    {
        var resultUpdateWaitingTime = await settingService.UpdateTimeSettingLeague(new TimeSettingRequest
        {
            AutoType = DirectSetting,
            LeagueId = request.NewSettings.LeagueId,
            WaitingTime = request.NewSettings.WaitingTime
        });

        var resultUpdateRefundWaitingTime = await settingService.UpdateTimeSettingLeague(new TimeSettingRequest
        {
            AutoType = RefundSetting,
            LeagueId = request.NewSettings.LeagueId,
            WaitingTime = request.NewSettings.RefundWaitingTime
        });

        return resultUpdateWaitingTime.ErrCode + resultUpdateRefundWaitingTime.ErrCode > 0
            ? new Result(1, $"{resultUpdateWaitingTime.ErrMsg}<br/>{resultUpdateRefundWaitingTime.ErrMsg}")
            : new Result();
    }

    private async Task<Result> UpdateAutoSetting(UpdateLeagueSettingsRequest request)
    {
        return await settingService.UpdateSettingLeague(new SettingLeagueRequest
        {
            AutoType = request.NewSettings.AutoSetting != 0 ? request.NewSettings.AutoSetting : request.OldSettings.AutoSetting,
            IsApplyAll = request.IsApplyAll,
            IsEnabled = request.NewSettings.AutoSetting != 0,
            LeagueId = request.NewSettings.LeagueId
        });
    }
}