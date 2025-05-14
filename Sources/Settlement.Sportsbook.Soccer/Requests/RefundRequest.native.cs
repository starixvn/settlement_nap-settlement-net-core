using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class RefundRequest : SettleBaseRequest, IRequest<Result>
{
    public bool IsSettleAbandonedMatchBetDaq { get; set; }

    public bool IsSettleAbandonedMatchBetFair { get; set; }

    public bool IsSettleAbandonedMatchIbc { get; set; }

    public bool ExcludeTicketBetDaqInRefund { get; set; }

    public bool ExcludeTicketBetFairInRefund { get; set; }

    public bool IsDeterminedHedgeMatch { get; set; }

    public short SportType { get; set; }
    public short ChildMatchType { get; set; }
    public int ParentId { get; set; }
}