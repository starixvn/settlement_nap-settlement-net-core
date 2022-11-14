using Fanex.Data;

namespace Settlement.EventManagement.Criteria
{
    public class GetWaitingCalculationCriteria : CriteriaBase
    {
        public int SportType { get; } = Core.Constants.SportType.Soccer;

        public string LeagueIds { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_WaitingSel_{DbServer}";
        }

        public override bool IsValid()
        {
            return SportType > 0;
        }
    }
}