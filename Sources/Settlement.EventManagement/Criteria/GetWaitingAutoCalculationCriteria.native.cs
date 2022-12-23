using Settlement.Core.Criteria;

namespace Settlement.EventManagement.Criteria;

public class GetWaitingAutoCalculationCriteria : MultipleSiteCriteria
{
    public int SportType { get; } = Core.Constants.SportType.Soccer;

    public int LeagueId { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_AutoPayout_WaitingSel_{DbServer}";
    }

    public override bool IsValid()
    {
        return SportType > 0;
    }
}