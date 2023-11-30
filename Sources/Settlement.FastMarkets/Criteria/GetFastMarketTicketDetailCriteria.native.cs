namespace Settlement.FastMarkets.Criteria;

public class GetFastMarketTicketDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_FastMarket_MatchSelDetail_Ticket_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}