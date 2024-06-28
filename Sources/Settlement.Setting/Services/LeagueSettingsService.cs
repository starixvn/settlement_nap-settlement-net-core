using AutoMapper;
using Fanex.Data.Repository;
using Fanex.RemotingRef;
using Settlement.Criteria;
using Settlement.Models;
using Settlement.Services;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Helpers;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.LeagueSettings;

namespace Settlement.Setting.Services;

public interface LeagueSettingsService
{
    public Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request);

    public Task<Result> UpdateLeagueSettings(UpdateLeagueSettingsRequest request);
}

public class LeagueSettingsServiceImp
    (IDynamicRepository repository, IRemotingRefService remotingRef, IMapper mapper, LogService logService, SettingService settingService)
    : LeagueSettingsService
{
    private const int ActionChangeLeagueSettingsId = 81048;

    private const int DirectSetting = 5;

    private const int RefundSetting = 7;

    public async Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request)
    {
        var criteria = new GetLeagueSettings
        {
            LeagueId = request.LeagueId,
            SportType = request.SportType
        };

        var leagueSettings = await repository.GetAsync<LeagueSettings>(criteria);

        leagueSettings.LeagueName = remotingRef.GetLeagueName(request.LeagueId.ToString(), "EN");
        leagueSettings.Providers = (await GetProviderInfo(request)).ToList();

        return leagueSettings;
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

    private async Task<IEnumerable<ProviderInfo>> GetProviderInfo(GetLeagueSettingsRequest request)
    {
        var criteria = new GetProviderInfoCriteria
        {
            SportType = request.SportType,
            LeagueId = request.LeagueId
        };

        return await repository.FetchAsync<ProviderInfo>(criteria);
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

        return resultUpdateWaitingTime.ErrCode + resultUpdateRefundWaitingTime.ErrCode > 0 ? new Result(1, $"{resultUpdateWaitingTime.ErrMsg}<br/>{resultUpdateRefundWaitingTime.ErrMsg}") : new Result();

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