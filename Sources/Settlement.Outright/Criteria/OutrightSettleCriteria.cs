using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class OutrightSettleCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Status { get; set; }

    public string Action { get; set; }

    public double Deadheat { get; set; }

    public bool IsDeadheat { get; set; }

    public int AdminId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName = "NAP_Admin_Settlement_Outright";

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_Outright_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}