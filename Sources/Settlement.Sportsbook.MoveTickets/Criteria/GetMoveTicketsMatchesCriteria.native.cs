using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class GetMoveTicketsMatchesCriteria : CriteriaBase
{
    public string MatchIds { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelInfo";
    }

    public override bool IsValid()
    {
        return MatchIds.Length > 0;
    }
}