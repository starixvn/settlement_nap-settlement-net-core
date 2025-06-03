using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class CalculationCriteria : NonQueryCommand
{
    public int AdminId { get; set; }

    public int MatchId { get; set; }

    public string SelectedSelection { get; set; }

    public string SelectedMarket { get; set; }

    public string Action { get; set; }

    public bool IsAuto { get; set; }

    public string Ip { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public string BroadcastSessionId { get; set; }
    public bool IsOrg { get; set; }

    public override string GetSettingKey() => $"NAP_Admin_Settlement_BetBuilder_Push_{DbServer}";

    public override bool IsValid() => AdminId > 0 && MatchId > 0;
}