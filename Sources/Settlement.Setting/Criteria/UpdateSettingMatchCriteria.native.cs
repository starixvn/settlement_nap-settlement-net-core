using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria
{
    public class UpdateSettingMatchCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public bool IsEnabled { get; set; }

        public int AutoType { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string Ip { get; set; }

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