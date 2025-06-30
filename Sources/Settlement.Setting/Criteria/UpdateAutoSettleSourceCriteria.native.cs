using Fanex.Data;

namespace Settlement.Setting.Criteria;

public class SourceSettleCriteriaBase
{
    public byte AutoType { get; set; } // 1: Auto Payout 1, 5: Direct, 6: Auto Payout 2, 7: Auto Refund
    public bool? Enable { get; set; } // for only 7: Auto Refund

    #region Main
    public int? Main_WaitingTime { get; set; }
    public bool? Main_HasTrader { get; set; }
    public byte? Main_NumberProvider { get; set; }
    public string Main_PrimaryProvider { get; set; }
    public byte? Main_TotalPrimaryProvider { get; set; }
    public string Main_SecondaryProvider { get; set; }
    public byte? Main_TotalSecondaryProvider { get; set; }
    public string Main_InactiveProvider { get; set; }
    #endregion

    #region Early
    public int? EAR_WaitingTime { get; set; }
    public bool? EAR_HasTrader { get; set; }
    public byte? EAR_NumberProvider { get; set; }
    public string EAR_PrimaryProvider { get; set; }
    public int? EAR_TotalPrimaryProvider { get; set; }
    public string EAR_SecondaryProvider { get; set; }
    public int? EAR_TotalSecondaryProvider { get; set; }
    public string EAR_InactiveProvider { get; set; }
    #endregion
}

public class UpdateLeagueAutoSettleSourceCriteria : SourceSettleCriteriaBase, AutoSettleRunUpdateCriteria
{
    public int LeagueId { get; set; }
    public bool IsApplyAll { get; set; }
    public string UpdatedMatchIDs { get; set; } = string.Empty;
    [SpParam(Ignored = true)]
    public int ErrCode { set; get; }

    [SpParam(Ignored = true)]
    public string ErrMsg { set; get; }

    public string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Update";

    public bool IsValid() => true;
}

public class UpdateMatchAutoSettleSourceCriteria : SourceSettleCriteriaBase, AutoSettleRunUpdateCriteria
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]

    public string UpdatedMatchIDs { get; set; }
    [SpParam(Ignored = true)]
    public int ErrCode { set; get; }

    [SpParam(Ignored = true)]
    public string ErrMsg { set; get; }

    public string GetSettingKey() => "NAP_Set_AutoPayout_MatchSetting_Update";

    public bool IsValid() => true;
}