namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetMatchDetailEarlyCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_MatchSelInfo_Auto_1s";

    public override bool IsValid() => MatchId > 0;
}