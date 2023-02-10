namespace Settlement.Sportsbook.Soccer.Models;

public class BetFair
{
    public bool IsMoveBetFair { get; set; }

    public bool IsExcludeBetFair { get; set; }

    public bool IsSettleAbandonedMatchBetFair { get; set; }

    public bool IsRefundRunningBetFair { get; set; }
}