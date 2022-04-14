using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria
{
    public class UpdateSettingLeagueCriteria : NonQueryCommand
    {
        private const int autoType = 3;

        public int LeagueId { get; set; }

        public int AutoType { get; } = autoType;

        public bool IsEnabled { get; set; }

        public bool IsApplyAll { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoPayout_SettingLeagueUpd";
        }

        public override bool IsValid()
        {
            return LeagueId > 0;
        }
    }
}