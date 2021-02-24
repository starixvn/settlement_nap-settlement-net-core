using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class GetChildMatchCriteria : CriteriaBase
    {
        public int matchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_GetChildMatchByParent";
        }

        public override bool IsValid()
        {
            return matchId > 0;
        }
    }
}