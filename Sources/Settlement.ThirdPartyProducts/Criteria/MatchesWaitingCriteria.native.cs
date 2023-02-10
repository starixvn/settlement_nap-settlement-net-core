using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class MatchesWaitingCriteria : CriteriaBase
{
    public string SportTypes { get; set; }

    public string SettleType { get; private set; } = "BBD";

    public string LeagueIds { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_WaitingSel_Queue_3rd_{DbServer}";
    }

    public override bool IsValid()
    {
        return true;
    }
}