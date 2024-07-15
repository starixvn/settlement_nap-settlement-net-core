using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria.Update;

public class UpdateSettlementStatusCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int Type { get; set; }

    public bool IsEnabled { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public override string GetSettingKey() => "NAP_Set_SettlementStatusUpd";

    public override bool IsValid() => MatchId > 0;
}