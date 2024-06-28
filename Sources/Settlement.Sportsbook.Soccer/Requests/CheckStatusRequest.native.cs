using Settlement.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class CheckStatusRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public string ActionName { get; set; }

    public bool IsSettleAbandonedMatchIBC { get; set; }

    public bool IsSettleDetermined { get; set; }

    public bool IsEarly { get; set; }
}