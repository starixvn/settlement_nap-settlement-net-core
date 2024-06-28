using Fanex.Data.Repository;

namespace Settlement.Criteria;

public class UpdateRemarkCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int Type { get; set; }

    public bool IsEnabled { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_SettlementStatusUpd";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}