namespace Settlement.Sportsbook.Soccer.Criteria;

public class BetFairCheckingCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_BetFair_Checking_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}