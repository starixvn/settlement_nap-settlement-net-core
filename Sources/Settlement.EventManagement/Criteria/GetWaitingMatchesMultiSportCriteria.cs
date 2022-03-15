using Fanex.Data.Repository;

namespace Settlement.EventManagement.Criteria
{
    public class GetWaitingMatchesMultiSportCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_WaitingOtherSportSel";
        }

        public override bool IsValid()
        {
            return !string.IsNullOrEmpty(MatchIds);
        }
    }
}