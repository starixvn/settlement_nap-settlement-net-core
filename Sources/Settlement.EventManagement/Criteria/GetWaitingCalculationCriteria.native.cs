using Settlement.Core.Criteria;

namespace Settlement.EventManagement.Criteria;

public class GetWaitingCalculationCriteria : MultipleSiteCriteria
{
    public string LeagueIds { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_WaitingSel_{DbServer}";
    }

    public override bool IsValid() => true;
}