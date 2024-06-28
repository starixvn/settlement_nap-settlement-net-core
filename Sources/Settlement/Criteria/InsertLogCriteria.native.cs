using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Criteria;

public class InsertLogCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public bool IsHedgeMatch { get; set; }

    public string Action { get; set; }

    public int Sporttype { get; set; }

    public bool IsAuto { get; set; } = false;

    public int AdminId { get; set; }

    public string SelectedResources { get; set; }

    public override string GetSettingKey() => "NAP_SettlementLog_Ins";

    public override bool IsValid() => MatchId > 0;
}