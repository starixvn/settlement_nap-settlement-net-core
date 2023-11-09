namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetMatchDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public bool IsRefundPage { get; set; }

    public override string GetSettingKey() => "NAP_Set_MatchSelDetail";

    public override bool IsValid() => MatchId > 0;
}