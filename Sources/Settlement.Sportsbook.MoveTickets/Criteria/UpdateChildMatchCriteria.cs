using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria
{
    public class UpdateChildMatchCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Admin_Match_Update";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
