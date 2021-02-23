namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    using Fanex.Data.Repository;

    public class GetWaitingMatchesCriteria : CriteriaBase
    {
        public int SportType { get; set; }

        public int LeagueId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoPayout_WaitingSel";
        }

        public override bool IsValid()
        {
            return SportType > 0;
        }
    }
}
