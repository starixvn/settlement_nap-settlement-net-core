namespace Settlement.Sportsbook.Aio.Criteria.Tennis;

public class GetProviderCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string SettleType { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ProviderExternalResultDetailLatestInfoSel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}