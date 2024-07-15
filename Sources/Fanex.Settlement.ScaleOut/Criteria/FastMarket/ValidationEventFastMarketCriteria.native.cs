namespace Fanex.Settlement.ScaleOut.Criteria.FastMarket;

public class ValidationEventFastMarketCriteria : ExecuteSingleCriteria
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public bool IsAuto { get; set; }

    public string Results { get; set; }

    public override string GetSettingKey() => "NAP_Admin_Settlement_ValidationFM_Event";

    public override bool IsValid() => MatchId > 0;
}