namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetTicketGroupCountCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }
    public override string GetSettingKey() => $"NAP_Set_MatchTicket_CheckingByGroupResult_{DbServer}";

    public override bool IsValid() => true;
}
