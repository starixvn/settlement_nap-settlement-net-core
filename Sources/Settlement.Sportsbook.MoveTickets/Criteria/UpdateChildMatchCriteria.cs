using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria
{
    public class UpdateChildMatchCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Command { get; } = "NAP_Admin_Settlement_1-CAL";

        public int FTHome { get; set; }

        public int FTAway { get; set; }

        public int HTHome { get; set; }

        public int HTAway { get; set; }

        public string Action { get; } = "CAL";

        public bool IsMovedMatch { get; } = true;

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
