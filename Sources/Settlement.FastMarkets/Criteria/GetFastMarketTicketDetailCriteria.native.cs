using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria;

public class GetFastMarketTicketDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string Resources { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_FastMarket_MatchSelDetail_Ticket_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}