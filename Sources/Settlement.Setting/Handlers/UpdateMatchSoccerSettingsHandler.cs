using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Helpers;
using Settlement.Setting.Requests;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class UpdateMatchSoccerSettingsHandler(
    SettingService settingService,
    IDynamicRepository dynamicRepository,
    LogService logService,
    INapSession napSession)
{
    public async Task<Result> HandleAsync(UpdateAutoSettingsCommand command)
    {
        var directSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoDirect);

        if (directSetting.Enabled)
        {
            await UpdateResultSetting(command, AutoSettleType.AutoDirect);
            await WriteLog(command, AutoSettleType.AutoDirect);
        }
        else
        {
            await UpdateResultSetting(command, AutoSettleType.AutoPayoutSoccer);
            await WriteLog(command, AutoSettleType.AutoPayoutSoccer);
        }

        await UpdateSettleSource(command, AutoSettleType.AutoRefund);
        await WriteLog(command, AutoSettleType.AutoRefund);

        return new Result();
    }

    private async Task UpdateResultSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings != null)
        {
            await settingService.UpdateSettingMatch(new SettingMatchRequest
            {
                MatchId = command.MatchId,
                AutoType = (int)settleType,
                IsEnabled = settings.Enabled,
            });
        }
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
            Main_WaitingTime = null,
            Enable = settings.Enabled,
        };

        await dynamicRepository.ExecuteAsync(criteria);
    }

    private async Task WriteLog(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var item = command.ResultSettings.Find(x => x.SettleType == settleType);
        var typePayout = LeagueSettingsHelper.AutoPayoutToText(item.SettleType);

        var title = $"Update Auto Payout setting on {command.TypeObject}: {command.MatchId}";
        var msg = $"{title} {typePayout}({item.Enabled}) WaitingTime({item.WaitingTime})";
        var actionLogId = LeagueSettingsHelper.GetActionLogId(command.TypeObject);

        var logCriteria = new LogCriteria(command.MatchId, msg, actionLogId, napSession.UserId);

        await logService.WriteLog(logCriteria);
    }
}