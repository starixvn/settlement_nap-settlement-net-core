namespace Settlement.Sportsbook.Aio.Criteria;

public class AutoRefundOSResultInsCriteria : NonQueryCommand
{
    public int MatchId { get; set; }
    public byte TypeId { get; set; }
    public string ResourceIds { get; set; }
    public int RowCount { get; set; }

    public override string GetSettingKey() => "NAP_AutoRefundOSResultInsCriteria";

    public override bool IsValid() => MatchId > 0;
}