namespace Settlement.FastMarkets.Criteria;

public class GetTimeMachineResultCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_FastMarket_GoalSequenceSel";

    public override bool IsValid() => MatchId > 0;
}