using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.NumberGame
{
    public class RecalculateNumberGameCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string BallResults { get; set; }

        public string Ip { get; set; }

        public int AdminId { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_s161_Manual";
        }

        public override bool IsValid()
        {
            return MatchId > 0 && AdminId > 0;
        }
    }
}