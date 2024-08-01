namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetResultDetailCriteria : CriteriaBase
{
    public string MatchIdList { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ResultDetailSel";
    }

    public override bool IsValid()
    {
        return !string.IsNullOrEmpty(MatchIdList);
    }
}