using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class CalculationCriteria : NonQueryCommand
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public string Resources { get; set; }

        public string Action { get; set; }

        public bool IsAuto { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_BetBuilder_Push";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}