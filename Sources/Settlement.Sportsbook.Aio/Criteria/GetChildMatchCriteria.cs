using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criteria
{
    public class GetChildMatchCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        public string Mode { get; set; }

        public string SelectedResources { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_GetChildMatchByParent";
        }

        public override bool IsValid()
        {
            return MatchIds.Length > 0;
        }
    }
}