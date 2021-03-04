using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class SaveScoreCriteriaBase : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }

    }
}
