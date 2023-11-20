namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetEarlyTicketInfoCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_MatchSelDetail_Auto_1s_Ticket_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}