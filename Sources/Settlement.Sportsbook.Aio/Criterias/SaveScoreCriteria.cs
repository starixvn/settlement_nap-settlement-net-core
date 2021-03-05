using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class SaveScoreCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int UserId { get; set; }

        public string OutsideSources { get; set; }

        public string Sources { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ExternalResultDetailOSIns";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }

    }
}
