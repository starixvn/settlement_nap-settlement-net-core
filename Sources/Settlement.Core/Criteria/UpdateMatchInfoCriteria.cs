using Fanex.Data.Repository;

namespace Settlement.Core.Criteria
{
    public class UpdateMatchInfoCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Action { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public int HalfTimeHome { get; set; }

        public int HalfTimeAway { get; set; }

        public string GoalRecord { get; set; }

        public string BetStatus { get; set; }

        public string ResourceResult { get; set; }

        public int SDTRecord { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_MatchInfoUpd";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}