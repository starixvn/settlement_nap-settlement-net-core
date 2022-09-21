using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class GetTicketInfoCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public bool IsRefundPage { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_MatchSelDetail_Ticket_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}