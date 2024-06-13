using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria.Update;

public class UpdateMatchInfo3RdCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int Creator { get; set; }

    public string Command { get; set; }

    public string Action { get; set; }

    public int? FTHome { get; set; }

    public int? FTAway { get; set; }

    public string BetStatus { get; set; }

    public override string GetSettingKey() => "NAP_Admin_Match_Update";

    public override bool IsValid() => MatchId > 0;
}