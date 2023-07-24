using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class GetTicketInfoCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string SelectedResources { get; set; }

    public string Action { get; set; }

    public int DeterminedType { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_CashoutSel_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}