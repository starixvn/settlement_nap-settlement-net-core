using Fanex.Data.Repository;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Handlers;

public class UpdateAutoSettingsHandler
{
    private readonly IDynamicRepository repository;

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
            var criteria = new UpdateLeagueAutoSettleRunningCriteria
            {
                AutoType = item.TypeSettle == "Payout" && item.TypeResult == "Main" ? (short)1 : (short)5,
                IsEnabled = item.Enabled,
                IsApplyAll = command.IsApplyAll,
                LeagueId = command.LeagueId,

            };

            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task UpdateSourceToAutoSettle(UpdateAutoSettingsCommand command)
    {
        var payoutMain = command.ResultSettings.First(x => x.TypeSettle == "Payout" && x.TypeResult == "Main");
        var payoutEarly = command.ResultSettings.First(x => x.TypeSettle == "Payout" && x.TypeResult == "Early");

        var sourceCriteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = 6,
            LeagueId = command.LeagueId,

            Main_HasTrader = payoutMain.IsTraderRequired,
            Main_NumberProvider = payoutMain.MinProvider,
            Main_PrimaryProvider = payoutMain.PrimaryProvider,
            Main_SecondaryProvider = payoutMain.SecondaryProvider,
            Main_TotalPrimaryProvider = (byte)payoutMain.Providers.Count(x => x.Priority == 1),
            Main_TotalSecondaryProvider = (byte)payoutMain.Providers.Count(x => x.Priority == 2),
            Main_WaitingTime = payoutMain.WaitingTime,
            Main_InactiveProvider = string.Join(",", payoutMain.Providers.Where(x => !x.IsActive).Select(x => x.SourceId)),

            EAR_HasTrader = payoutEarly.IsTraderRequired,
            EAR_NumberProvider = payoutEarly.MinProvider,
            EAR_PrimaryProvider = payoutEarly.PrimaryProvider,
            EAR_SecondaryProvider = payoutEarly.SecondaryProvider,
            EAR_TotalPrimaryProvider = payoutEarly.Providers.Count(x => x.Priority == 1),
            EAR_TotalSecondaryProvider = payoutEarly.Providers.Count(x => x.Priority == 2),
            EAR_WaitingTime = payoutEarly.WaitingTime,
            EAR_InactiveProvider = string.Join(",", payoutEarly.Providers.Where(x => !x.IsActive).Select(x => x.SourceId))


        };

        await repository.ExecuteAsync(sourceCriteria);
    }

    public class UpdateLeagueAutoSettleRunningCriteria : NonQueryCommand
    {
        public int LeagueId { get; set; }
        public short AutoType { get; set; } // 1: Auto Payout 1/ Auto Payout 2 - Main, 5: Auto Payout - Direct, 6: Auto Payout 2 - Early
        public bool IsEnabled { get; set; }
        public bool IsApplyAll { get; set; } // 1: Apply all league and child match, 0: Apply only this league
        public int AdminId { get; set; }
        public string Ip { get; set; }
        public string UpdatedMatchIDs { get; set; } // out
        public int ErrCode { get; set; } // out
        public string ErrMsg { get; set; } // out

        public override string GetSettingKey() => "NAP_Set_AutoPayout_SettingLeagueUpd";

        public override bool IsValid() => true;
    }

    public class UpdateMatchAutoSettleRunningCriteria : ICriteria
    {
        public int MatchId { get; set; }
        public short AutoType { get; set; } // 1: Payout, 2: Early
        public bool IsEnabled { get; set; }
        public int AdminId { get; set; }
        public string Ip { get; set; }
        public int ErrCode { get; set; } // out
        public string ErrMsg { get; set; } // out

        public string GetSettingKey() => "[NAP_Set_AutoPayout_SettingMatchUpd]";

        public bool IsValid() => true;
    }

    public class UpdateLeagueAutoSettleSourceCriteria : NonQueryCommand
    {
        public int LeagueId { get; set; }
        public byte AutoType { get; set; } = 6; // 1: Auto Payout 1/ Auto Payout 2 - Main, 5: Auto Payout - Direct, 6: Auto Payout 2 - Early

        #region Main
        public int Main_WaitingTime { get; set; }
        public bool Main_HasTrader { get; set; }
        public byte Main_NumberProvider { get; set; }
        public string Main_PrimaryProvider { get; set; }
        public byte Main_TotalPrimaryProvider { get; set; }
        public string Main_SecondaryProvider { get; set; }
        public byte Main_TotalSecondaryProvider { get; set; }
        public string Main_InactiveProvider { get; set; }
        #endregion

        #region Early
        public int EAR_WaitingTime { get; set; }
        public bool EAR_HasTrader { get; set; }
        public byte EAR_NumberProvider { get; set; }
        public string EAR_PrimaryProvider { get; set; }
        public int EAR_TotalPrimaryProvider { get; set; }
        public string EAR_SecondaryProvider { get; set; }
        public int EAR_TotalSecondaryProvider { get; set; }
        public string EAR_InactiveProvider { get; set; }
        #endregion


        public override string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Update";

        public override bool IsValid() => true;
    }


    public class UpdateMatchAutoSettleSourceCriteria : ICriteria
    {
        public int MatchId { get; set; }
        public byte AutoType { get; set; } = 6; // 1: Auto Payout 1/ Auto Payout 2 - Main, 5: Auto Payout - Direct, 6: Auto Payout 2 - Early

        #region Main
        public int Main_WaitingTime { get; set; }
        public bool Main_HasTrader { get; set; }
        public byte Main_NumberProvider { get; set; }
        public string Main_PrimaryProvider { get; set; }
        public byte Main_TotalPrimaryProvider { get; set; }
        public string Main_SecondaryProvider { get; set; }
        public int Main_TotalSecondaryProvider { get; set; }
        public string Main_InactiveProvider { get; set; }
        #endregion

        #region Early
        public int EAR_WaitingTime { get; set; }
        public bool EAR_HasTrader { get; set; }
        public byte EAR_NumberProvider { get; set; }
        public string EAR_PrimaryProvider { get; set; }
        public int EAR_TotalPrimaryProvider { get; set; }
        public string EAR_SecondaryProvider { get; set; }
        public int EAR_TotalSecondaryProvider { get; set; }
        public string EAR_InactiveProvider { get; set; }
        #endregion


        public string GetSettingKey() => "NAP_Set_AutoPayout_MatchSetting_Update";

        public bool IsValid() => true;
    }
}