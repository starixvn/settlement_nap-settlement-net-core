using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class CopyResultCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int DestinationMatchId { get; set; }

    public bool IsOverrideResult { get; set; }

    public int AdminId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Admin_Settlement_CopyResult";
    }

    public override bool IsValid()
    {
        return AdminId > 0 && MatchId > 0;
    }
}