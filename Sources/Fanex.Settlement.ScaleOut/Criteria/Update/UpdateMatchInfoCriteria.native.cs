using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria.Update;

public class UpdateMatchInfoCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public string Action { get; set; }

    public string Mode { get; set; }

    public bool IsAuto { get; set; }

    public int? FullTimeHome { get; set; }

    public int? FullTimeAway { get; set; }

    public int? HalfTimeHome { get; set; }

    public int? HalfTimeAway { get; set; }

    public string GoalRecord { get; set; }

    public string BetStatus { get; set; }

    public string ResourceResult { get; set; }

    public string SelectedResources { get; set; }

    public string SelectedMarket { get; set; }

    public string SelectedSelection { get; set; }

    public string Results { get; set; }

    public string EventCounters { get; set; }

    public bool IsSettleDetermined { get; set; }

    public int? SDTRecord { get; set; }

    public bool IsHtTicketSettled { get; set; }

    public int DeterminedType { get; set; }

    public override string GetSettingKey() => "NAP_Admin_MatchInfoUpd";

    public override bool IsValid() => MatchId > 0;
}