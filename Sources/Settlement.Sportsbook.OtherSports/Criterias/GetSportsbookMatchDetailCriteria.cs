using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class GetSportsbookMatchDetailCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public bool IsRefundPage { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MatchSelDetail";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}