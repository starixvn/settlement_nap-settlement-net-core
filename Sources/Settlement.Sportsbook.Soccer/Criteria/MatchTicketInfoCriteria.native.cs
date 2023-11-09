namespace Settlement.Sportsbook.Soccer.Criteria;

public class MatchTicketInfoCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override bool IsValid()
    {
        return MatchId > 0;
    }

    public override string GetSettingKey()
    {
        return $"NAP_Set_AutoInstant_GetTicketInfo_{DbServer}";
    }
}