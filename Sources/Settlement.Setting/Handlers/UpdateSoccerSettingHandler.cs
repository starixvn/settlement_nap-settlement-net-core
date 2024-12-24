using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Requests;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class UpdateSoccerSettingHandler
{
    private readonly SettingService settingService;
    private readonly IDynamicRepository dynamicRepository;

    public UpdateSoccerSettingHandler(SettingService settingService, IDynamicRepository dynamicRepository)
    {
        this.settingService = settingService;
        this.dynamicRepository = dynamicRepository;
    }

    public async Task<Result> HandleAsync(UpdateAutoSettingsCommand command)
    {
        // league
        await UpdateResultSetting(command, AutoSettleType.AutoPayout1);
        await UpdateResultSetting(command, AutoSettleType.AutoDirect);

        await UpdateLeagueTimeSetting(command, AutoSettleType.AutoDirect);

        await UpdateLeagueAutoSettleSource(command, AutoSettleType.AutoRefund);

        return new Result();
    }

    private async Task UpdateResultSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return;
        };

        await settingService.UpdateSettingLeague(new SettingLeagueRequest
        {
            LeagueId = command.LeagueId,
            AutoType = (int)settleType,
            IsEnabled = settings.Enabled,
            IsApplyAll = settings.IsApplyChildMatches
        });
    }

    private async Task UpdateLeagueTimeSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return;
        }

        await settingService.UpdateTimeSettingLeague(new TimeSettingRequest
        {
            LeagueId = command.LeagueId,
            AutoType = (int)settleType,
            WaitingTime = settings.WaitingTime
        });
    }
    private async Task UpdateLeagueAutoSettleSource(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return;
        };

        var criteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)settleType,
            LeagueId = command.LeagueId,
            Main_WaitingTime = settings.WaitingTime,
            Enable = settings.Enabled
        };

        await dynamicRepository.ExecuteAsync(criteria);
    }
}
