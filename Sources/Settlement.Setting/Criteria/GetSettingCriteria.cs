using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria
{
    public class GetSettingCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public int LeagueId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoSettingSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0 || LeagueId > 0;
        }
    }
}