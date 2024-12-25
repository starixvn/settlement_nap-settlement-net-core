using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Requests;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class UpdateMatchSoccerSettingsHandler
{
    private readonly SettingService settingService;
    private readonly IDynamicRepository dynamicRepository;

    public UpdateMatchSoccerSettingsHandler(SettingService settingService, IDynamicRepository dynamicRepository)
    {
        this.settingService = settingService;
        this.dynamicRepository = dynamicRepository;
    }

    public async Task<Result> HandleAsync(UpdateAutoSettingsCommand command)
    {
        var payoutSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoPayout1);
        var directSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoDirect);
        if (payoutSetting.Enabled)
        {
            await UpdateResultSetting(command, AutoSettleType.AutoPayout1);
        }
        else if (directSetting.Enabled)
        {
            await UpdateResultSetting(command, AutoSettleType.AutoDirect);
            await UpdateSettleSource(command, AutoSettleType.AutoDirect);

        }
        else
        {
            await UpdateResultSetting(command, AutoSettleType.AutoPayout1);
        }

        await UpdateSettleSource(command, AutoSettleType.AutoRefund);

        return new Result();
    }

    private async Task UpdateResultSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return;
        }

        await settingService.UpdateSettingMatch(new SettingMatchRequest
        {
            MatchId = command.MatchId,
            AutoType = (int)settleType,
            IsEnabled = settings.Enabled,
        });
    }

    private async Task UpdateSettleSource(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return;
        }

        var criteria = new UpdateMatchAutoSettleSourceCriteria
        {
            MatchId = command.MatchId,
            AutoType = (byte)settleType,
            Main_WaitingTime = settings.WaitingTime,
            Enable = settleType == AutoSettleType.AutoRefund ? settings.Enabled : null,
        };

        await dynamicRepository.ExecuteAsync(criteria);
    }
}