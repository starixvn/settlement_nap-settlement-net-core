using Fanex.Data.Repository;

public class SaveScoreCriteria : INonQueryCommand
{
    public int LeagueId { get; set; }

    public int SourceId { get; set; }

    public string Resources { get; set; }

    public string GetSettingKey() => "NAP_Set_ProviderResultDetailOutrightIns";

    public bool IsValid() => LeagueId > 0;
}