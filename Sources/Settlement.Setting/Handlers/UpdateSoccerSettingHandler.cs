using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Helpers;
using Settlement.Setting.Requests;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class UpdateSoccerSettingHandler
{
    private readonly SettingService settingService;
    private readonly IDynamicRepository dynamicRepository;
    private readonly LogService logService;
    private readonly INapSession napSession;

    public UpdateSoccerSettingHandler(SettingService settingService, IDynamicRepository dynamicRepository, LogService logService, INapSession napSession)
    {
        this.settingService = settingService;
        this.dynamicRepository = dynamicRepository;
        this.logService = logService;
        this.napSession = napSession;
    }

    public async Task<Result> HandleAsync(UpdateAutoSettingsCommand command)
    {
        var payoutSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoPayout1);
        var directSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoDirect);
        var refundSetting = command.ResultSettings.Find(x => x.SettleType == AutoSettleType.AutoRefund);

        if (payoutSetting.Enabled)
        {
            var result = await UpdateResultSetting(command, AutoSettleType.AutoPayout1);
            await WriteLog(command, AutoSettleType.AutoPayout1, result);
        }
        else if (directSetting.Enabled)
        {
            var result = await UpdateResultSetting(command, AutoSettleType.AutoDirect);
            await UpdateLeagueTimeSetting(command, AutoSettleType.AutoDirect);
            await WriteLog(command, AutoSettleType.AutoDirect, result);
        }
        else
        {
            var result = await UpdateResultSetting(command, AutoSettleType.AutoPayout1);
            await WriteLog(command, AutoSettleType.AutoPayout1, result);
        }

        return await UpdateRefundSetting(command);
    }

    private async Task<Result> UpdateRefundSetting(UpdateAutoSettingsCommand command)
    {
        var result = await UpdateLeagueAutoSettleSource(command, AutoSettleType.AutoRefund);
        await WriteLog(command, AutoSettleType.AutoRefund, result);

        return result;
    }

    private async Task WriteLog(UpdateAutoSettingsCommand command, AutoSettleType settleType, Result result)
    {
        var item = command.ResultSettings.Find(x => x.SettleType == settleType);
        var typePayout = LeagueSettingsHelper.AutoPayoutToText(item.SettleType);

        var title = $"Update Auto Payout setting on {command.TypeObject}: {command.LeagueId}/{command.MatchId}";
        var msg = $"{title} {typePayout}({item.Enabled}) WaitingTime({item.WaitingTime}) applyMatch({result.ChildMatchIds})";

        var actionLogId = LeagueSettingsHelper.GetActionLogId(command.TypeObject);

        var logCriteria = new LogCriteria(command.MatchId, msg, actionLogId, napSession.UserId);

        await logService.WriteLog(logCriteria);
    }

    private async Task<Result> UpdateResultSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        var oldSettings = command.OldResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null || oldSettings == null)
        {
            return new Result();
        }

        var result = await settingService.UpdateSettingLeague(new SettingLeagueRequest
        {
            LeagueId = command.LeagueId,
            AutoType = (int)settleType,
            IsEnabled = settings.Enabled,
            IsApplyAll = settings.IsApplyChildMatches
        });

        return result;
    }

    private async Task UpdateLeagueTimeSetting(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        var oldSettings = command.OldResultSettings.Find(x => x.SettleType == settleType);

        if (settings == null || oldSettings == null)
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

    private async Task<Result> UpdateLeagueAutoSettleSource(UpdateAutoSettingsCommand command, AutoSettleType settleType)
    {
        var settings = command.ResultSettings.Find(x => x.SettleType == settleType);
        if (settings == null)
        {
            return new Result();
        }

        var criteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)settleType,
            LeagueId = command.LeagueId,
            Main_WaitingTime = settings.WaitingTime,
            Enable = settings.Enabled,
            IsApplyAll = settings.IsApplyChildMatches
        };

        await dynamicRepository.ExecuteAsync(criteria);

        return new Result
        {
            ChildMatchIds = criteria.UpdatedMatchIds
        };
    }


}
