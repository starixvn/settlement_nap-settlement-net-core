using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class LogCriteria : NonQueryCommand
{
    public LogCriteria(int matchId, string errorMessage, int actionId)
    {
        MatchId = matchId;
        Remark = errorMessage;
        ActionId = actionId;
    }

    public int UserId { get; }

    public int MatchId { get; set; }

    public string Remark { get; set; }

    public string Ip { get; } = string.Empty;

    public int ActionId { get; }

    public override bool IsValid()
    {
        return MatchId > 0;
    }

    public override string GetSettingKey()
    {
        return "WriteLog_UserLog_Settle";
    }
}