using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.OutsideSourceManager
{
    public class GetLeagueOutsideSourceCriteria : NonQueryCommand
    {
        public int LeagueID { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_OutsideSourceByLeagueSel";
        }

        public override bool IsValid()
        {
            return LeagueID > 0;
        }
    }
}