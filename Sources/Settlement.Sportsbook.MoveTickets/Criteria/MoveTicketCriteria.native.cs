using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

public class MoveTicketCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public DateTime EventDate { get; set; }

    public int ChildMatchId { get; set; }

    public string Resources { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_50_MoveTicket";

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_50_MoveTicket_{DbServer}";
    }

    public override bool IsValid()
    {
        return AdminId > 0 && MatchId > 0;
    }
}