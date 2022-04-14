using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria
{
    public class CheckingMarkedTicketsCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public string Results { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_FastMarket_CheckingMarkedTransaction";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}