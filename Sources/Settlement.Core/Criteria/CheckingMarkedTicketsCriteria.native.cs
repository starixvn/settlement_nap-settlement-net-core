using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;
public class CheckingMarkedTicketsCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }

    public bool IsExistMarkedTicket { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_EarlySettlement_CheckingMarkedTransaction_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}