using Fanex.Data.Repository;
using Fanex.Data;

namespace Settlement.Sportsbook.Aio.Criteria
{
    public class GetTicketDetailsCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public string SettleType { get; set; }

        public int SportType { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_MatchSelDetail_Resources_Ticket_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
