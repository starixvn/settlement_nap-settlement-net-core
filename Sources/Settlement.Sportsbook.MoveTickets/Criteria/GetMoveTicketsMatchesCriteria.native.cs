using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class GetMoveTicketsMatchesCriteria : CriteriaBase
{
    public string MatchIds { get; set; }

    public override string GetSettingKey() => "NAP_Set_MatchSelInfo";

    public override bool IsValid() => MatchIds.Length > 0;
}