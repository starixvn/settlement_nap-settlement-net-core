namespace Settlement.FastMarkets.Criteria;

public class CheckingMarkedTicketsCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string Results { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_FastMarket_CheckingMarkedTransaction_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}