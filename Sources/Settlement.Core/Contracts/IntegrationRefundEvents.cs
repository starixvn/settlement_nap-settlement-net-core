using Settlement.Core.Models;

namespace AutoEarlyRefund.Contracts;

public record ResultsRefunded(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    string Action,
    List<ResourceItem> Resources,
    string EventId = "Refund"
    );

public record ResultsRefundConfirmed(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    string Action,
    List<ResourceItem> Resources,
    string EventId = "CfnRefund"
    );

public record ResultsRefundConfirmedSdt(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    string Action,
    List<ResourceItem> Resources,
    string EventId = "CfnRefundSDT"
    );

public record MatchCalculated(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    string Action,
    int? HalfTimeHomeScore,
    int? HalfTimeAwayScore,
    int? FinalHomeScore,
    int? FinalAwayScore
    );