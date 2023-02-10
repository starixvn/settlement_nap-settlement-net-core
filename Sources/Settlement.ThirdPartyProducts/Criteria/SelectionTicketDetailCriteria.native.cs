using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class SelectionTicketDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_SMPSelectionDetailSel_Ticket_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}