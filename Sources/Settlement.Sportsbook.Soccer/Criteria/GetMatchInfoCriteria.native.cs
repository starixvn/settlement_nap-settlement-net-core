namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetMatchInfoCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_MatchSelInfo";

    public override bool IsValid() => MatchId > 0;
}