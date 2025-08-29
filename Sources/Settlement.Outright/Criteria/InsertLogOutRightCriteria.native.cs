using Fanex.Data.Repository;

public class InsertLogOutRightCriteria : NonQueryCommand
{
    public int UserId { get; set; }

    public int MatchId { get; set; }

    public int ActionId { get; set; }

    public int LeagueId { get; set; }

    public string Result { get; set; }

    public string Remark { get; set; }

    public DateTimeOffset EventDate { get; set; }

    public override string GetSettingKey() => "WriteLog_UserLog_SettleOutright";

    public override bool IsValid() => true;

}
