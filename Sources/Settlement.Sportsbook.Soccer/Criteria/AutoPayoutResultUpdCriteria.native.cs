namespace Settlement.Sportsbook.Soccer.Criteria;

public class AutoPayoutResultUpdCriteria : INonQueryCommand
{
    public int MatchId { get; set; }

    public int SourceId { get; set; }

    public int TypeId { get; set; }
    public int StatusId { get; set; }

    public string GetSettingKey() => "NAP_Set_AutoPayoutResultUpd";

    public bool IsValid() => true;
}