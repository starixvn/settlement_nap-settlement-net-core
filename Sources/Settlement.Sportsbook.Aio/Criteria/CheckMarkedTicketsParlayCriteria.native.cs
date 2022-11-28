namespace Settlement.Sportsbook.Aio.Criteria;

public class CheckMarkedTicketsParlayCriteria : NonQueryCommand
{
    private const string RefundParlayAction = "MP_REFUND";

    public int MatchId { get; set; }

    public string Action { get; } = RefundParlayAction;

    public bool IsExistMarkedTicket { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_CheckingMarkedTransaction";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}