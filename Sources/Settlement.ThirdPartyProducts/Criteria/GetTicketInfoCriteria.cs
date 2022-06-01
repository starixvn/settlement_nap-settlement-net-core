using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class GetTicketInfoCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_CashoutSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}