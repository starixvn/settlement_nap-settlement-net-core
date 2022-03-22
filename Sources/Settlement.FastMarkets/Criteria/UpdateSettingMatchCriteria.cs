using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria
{
    public class UpdateSettingMatchCriteria : NonQueryCommand
    {
        private const int autoType = 3;

        public int MatchId { get; set; }

        public int AutoType { get; } = autoType;

        public bool IsEnabled { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoPayout_SettingMatchUpd";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}