using Settlement.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class RefundRunningThirdPartyTicketRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public string ActionName { get; set; }
}