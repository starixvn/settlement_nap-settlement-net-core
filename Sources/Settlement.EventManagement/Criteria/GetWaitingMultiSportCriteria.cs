using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.EventManagement.Criteria
{
    public class GetWaitingMultiSportCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_WaitingOtherSportSel_{DbServer}";
        }

        public override bool IsValid()
        {
            return !string.IsNullOrEmpty(MatchIds);
        }
    }
}