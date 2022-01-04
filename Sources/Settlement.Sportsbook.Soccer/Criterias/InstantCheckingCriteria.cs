using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criterias
{
    public class InstantCheckingCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int InstantKey { get; set; }

        public string HomeScore { get; set; }

        public string AwayScore { get; set; }

        public string Action { get; set; }

        public string Mode { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Settlement_InstantCalculation_Checking";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}