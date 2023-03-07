using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria;

public class CheckingMarkedTicketsCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public bool IsExistMarkedTicket { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_CheckingMarkedTransaction_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}