namespace Settlement.Sportsbook.Aio.Criteria;

public class GetResourceIndexCriteria : CriteriaBase
{
    public int SportType { get; set; }

    public override string GetSettingKey() => "NAP_Admin_MajorRound_Sel";

    public override bool IsValid() => SportType > 0;
}