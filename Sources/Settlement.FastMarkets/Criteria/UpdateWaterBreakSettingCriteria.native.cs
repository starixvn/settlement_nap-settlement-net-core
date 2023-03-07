using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria;

public class UpdateWaterBreakSettingCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string SpecialSession { get; set; }

    public string EventCounters { get; set; }

    public string Action { get; set; }

    public bool IsAuto { get; set; }

    public int AdminId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_FastMarket_ResultDetailUpd";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}