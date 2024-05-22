namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetResultConfirmRefundCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_ResultConfirmRefundSel";

    public override bool IsValid() => MatchId > 0;
}