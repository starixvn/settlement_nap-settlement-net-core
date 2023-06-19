using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.Happy5;

public class SettlementCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public int AdminId { get; set; }

    public bool IsAuto { get; set; }

    public string Ip { get; set; }

    public string StrOldResult { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_s164";

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_s164_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}