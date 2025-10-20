namespace Settlement.Sportsbook.Aio.Criteria;

public class GenerateRelatedResourcesCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }

    public override string GetSettingKey() => "NAP_Set_GeneratePlayerInfo";

    public override bool IsValid() => MatchId > 0;
}