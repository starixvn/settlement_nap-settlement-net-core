using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class LogCriteria : NonQueryCommand
{
    public LogCriteria(int matchId, string errorMessage, int actionId, int userId)
    {
        MatchId = matchId;
        Remark = errorMessage;
        ActionId = actionId;
        UserId = userId;
    }

    public LogCriteria(string errorMessage, int actionId, int userId)
    {
        Remark = errorMessage;
        ActionId = actionId;
        UserId = userId;
    }

    public LogCriteria()
    {
    }

    public int UserId { get; set; }

    public int? MatchId { get; set; }

    public string Remark { get; set; }
    public string RemarkJson { get; set; }

    public string Ip => string.Empty;

    public int ActionId { get; set; }

    public override bool IsValid() => true;

    public override string GetSettingKey() => "WriteLog_UserLog_Settle";
}