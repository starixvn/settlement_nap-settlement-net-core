namespace Settlement.Sportsbook.Aio.Criteria;

public class GetResultConfirmRefundCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ResultConfirmRefundSel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}