using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class UpdateChildMatchRemarkCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Command => "C";

    public bool IsMovedMatch => true;

    public override string GetSettingKey()
    {
        return "NAP_UpdateMatch_Remark";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}