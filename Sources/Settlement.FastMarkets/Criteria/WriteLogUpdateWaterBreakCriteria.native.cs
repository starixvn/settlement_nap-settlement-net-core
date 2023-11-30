namespace Settlement.FastMarkets.Criteria;

public class WriteLogUpdateWaterBreakCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int UserId { get; set; }

    public int ActionId { get; set; }

    public string Remark { get; set; }

    public string Ip { get; set; }

    public override string GetSettingKey() => "WriteLog_UserLog_Settle";

    public override bool IsValid() => MatchId > 0;
}