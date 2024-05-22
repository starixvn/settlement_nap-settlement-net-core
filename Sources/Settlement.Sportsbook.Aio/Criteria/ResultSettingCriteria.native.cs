namespace Settlement.Sportsbook.Aio.Criteria;

public class ResultSettingCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }

    public bool IsEnabled { get; set; }

    public int Type { get; set; }

    public int AdminId { get; set; }

    public string SelectedResources { get; set; }

    public bool Is3x3 { get; set; }

    public override string GetSettingKey() => "NAP_Set_ResultDetailSettingUpd";

    public override bool IsValid() => MatchId > 0;
}