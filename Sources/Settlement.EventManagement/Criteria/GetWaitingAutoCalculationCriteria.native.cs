namespace Settlement.EventManagement.Criteria;

public class GetWaitingAutoCalculationCriteria : CriteriaBase
{
    public int SportType { get; } = Core.Constants.SportType.Soccer;

    public int LeagueId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_AutoPayout_WaitingSel_{DbServer}";
    }

    public override bool IsValid()
    {
        return SportType > 0;
    }
}