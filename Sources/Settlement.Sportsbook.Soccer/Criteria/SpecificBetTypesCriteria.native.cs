namespace Settlement.Sportsbook.Soccer.Criteria;

public class SpecificBetTypesCriteria : CriteriaBase
{
    public string Action { get; set; }

    public string Type { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_SpecificBettypes";
    }

    public override bool IsValid()
    {
        return !string.IsNullOrEmpty(Action) && !string.IsNullOrEmpty(Type);
    }
}