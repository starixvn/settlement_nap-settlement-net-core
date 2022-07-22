using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class CalculateCriteria : NonQueryCommand
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public int HalfTimeHome { get; set; }

        public int HalfTimeAway { get; set; }

        public string GoalRecord { get; set; }

        public string BetStatus { get; set; }

        public string ResourceResult { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public bool IsReSettledTickets { get; set; } = true;

        public string ChildMatchIds { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName = "NAP_Admin_Settlement_1_Push";

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }

        public override string GetSettingKey()
        {
            return $"Calculate_{DbServer}";
        }
    }
}