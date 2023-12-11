namespace Settlement.FastMarkets.Criteria;

public class GetMatchDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_MatchSelInfo_Auto_1s";

    public override bool IsValid() => MatchId > 0;
}