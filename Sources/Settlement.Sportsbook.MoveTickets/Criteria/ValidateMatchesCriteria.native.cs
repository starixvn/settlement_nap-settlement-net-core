using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class ValidateMatchesCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int DestinationMatchId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Admin_Settlement_MoveTicketChecking";
    }

    public override bool IsValid()
    {
        return MatchId != 0;
    }
}