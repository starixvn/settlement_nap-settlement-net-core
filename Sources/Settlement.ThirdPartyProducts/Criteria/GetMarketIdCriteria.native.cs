using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class GetMarketIdCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public string SelectedSelection { get; set; }

        public int ResultStatusId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_ChangedMarket_Sel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}