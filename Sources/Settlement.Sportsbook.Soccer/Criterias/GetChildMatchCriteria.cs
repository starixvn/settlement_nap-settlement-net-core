using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criterias
{
    public class GetChildMatchCriteria : CriteriaBase
    {
        public string matchIds { get; set; }

        public string mode { get; set; }

        public string SelectedResources { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_GetChildMatchByParent";
        }

        public override bool IsValid()
        {
            return matchIds.Length > 0;
        }
    }
}