using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class AddAutoResultCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int SourceId { get; set; } = 100;

        public int TypeId { get; set; }

        public int HomeValue { get; set; }

        public int AwayValue { get; set; }

        public int StatusId { get; set; }

        public int InstantKey { get; set; }

        public int ChildMatchType { get; set; }

        public bool IsInstCalculated { get; set; }

        public override bool IsValid()
        {
            return MatchId > 0;
        }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoPayoutResultIns";
        }
    }
}