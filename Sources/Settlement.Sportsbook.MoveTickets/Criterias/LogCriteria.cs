using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    public class LogCriteria : NonQueryCommand
    {
        public LogCriteria(int matchId, string errorMessage)
        {
            MatchId = matchId;
            Remark = errorMessage;
            ActionId = 81026;
        }

        public int UserId { get; }

        public int MatchId { get; set; }

        public string Remark { get; set; }

        public string IP { get; } = string.Empty;

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
}