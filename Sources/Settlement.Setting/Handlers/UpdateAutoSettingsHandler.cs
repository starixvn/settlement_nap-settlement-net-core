using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Microsoft.AspNetCore.Http;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Handlers;

public class UpdateAutoSettingsHandler
{
    private readonly IDynamicRepository repository;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;

    public UpdateAutoSettingsHandler(IDynamicRepository repository)
    {
        this.repository = repository;
    }
    public async Task HandleAsync(UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        await EnableAutoSettle(command);
        await UpdateSourceToAutoSettle(command);
    }

    private async Task EnableAutoSettle(UpdateAutoSettingsCommand command)
    {

        foreach (var item in command.ResultSettings)
        {
            var criteria = CreateUpdateAutoSettleRunningCriteriaFactory(command, item);
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task UpdateSourceToAutoSettle(UpdateAutoSettingsCommand command)
    {
        var payoutSourceCriteria = CreateUpdateAutoSettleSourceCriteriaFactory(command);
        var refundMain = command.ResultSettings.First(x => x.SettleType == AutoSettleType.AutoRefund && x.ResourceType == ResourceType.Main);

        var refundSourceCriteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)AutoSettleType.AutoRefund,
            LeagueId = command.LeagueId,
            Main_WaitingTime = refundMain.WaitingTime,
        };

        await repository.ExecuteAsync(payoutSourceCriteria);
        await repository.ExecuteAsync(refundSourceCriteria);
    }

    private INonQueryCommand CreateUpdateAutoSettleRunningCriteriaFactory(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var autoType = item.ResourceType == ResourceType.Main && item.SettleType == AutoSettleType.AutoPayout ? (short)1 : (short)6;
        INonQueryCommand criteria = command.TypeObject == "League"
               ? new UpdateLeagueAutoSettleRunningCriteria
               {
                   AutoType = autoType,
                   IsEnabled = item.Enabled,
                   IsApplyAll = command.IsApplyAll,
                   LeagueId = command.LeagueId,
                   //AdminId = currentSession.UserId,
                   //Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               }
               : new UpdateMatchAutoSettleRunningCriteria
               {
                   AutoType = autoType,
                   IsEnabled = item.Enabled,
                   MatchId = command.MatchId,
                   //AdminId = currentSession.UserId,
                   //Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               };
        return criteria;
    }

    private INonQueryCommand CreateUpdateAutoSettleSourceCriteriaFactory(UpdateAutoSettingsCommand command)
    {
        var payoutMain = command.ResultSettings.First(x => x.SettleType == AutoSettleType.AutoPayout && x.ResourceType == ResourceType.Main);
        var payoutEarly = command.ResultSettings.First(x => x.SettleType == AutoSettleType.AutoPayout && x.ResourceType == ResourceType.Early);

        var payoutSourceCriteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)AutoSettleType.AutoPayout,
            LeagueId = command.LeagueId,

            Main_WaitingTime = payoutMain.WaitingTime,
            Main_HasTrader = payoutMain.IsTraderRequired,
            Main_NumberProvider = payoutMain.MinProvider,
            Main_PrimaryProvider = payoutMain.PrimaryProvider,
            Main_TotalPrimaryProvider = payoutMain.TotalPrimaryProvider,
            Main_SecondaryProvider = payoutMain.SecondaryProvider,
            Main_TotalSecondaryProvider = payoutMain.TotalSecondaryProvider,
            Main_InactiveProvider = payoutMain.InactiveProvider,

            EAR_WaitingTime = payoutEarly.WaitingTime,
            EAR_HasTrader = payoutEarly.IsTraderRequired,
            EAR_NumberProvider = payoutEarly.MinProvider,
            EAR_PrimaryProvider = payoutEarly.PrimaryProvider,
            EAR_TotalPrimaryProvider = payoutEarly.TotalPrimaryProvider,
            EAR_SecondaryProvider = payoutEarly.SecondaryProvider,
            EAR_TotalSecondaryProvider = payoutEarly.TotalSecondaryProvider,
            EAR_InactiveProvider = payoutEarly.InactiveProvider
        };

        return payoutSourceCriteria;
    }
}