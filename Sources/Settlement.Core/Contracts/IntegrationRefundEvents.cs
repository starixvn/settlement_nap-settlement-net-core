using Settlement.Core.Models;

namespace AutoEarlyRefund.Contracts;

public record MatchCalculated(
    int MatchId,
    int Action,
    int EventId);

public record MatchRefunded(
    int MatchId,
    int Action,
    int EventId);

public record ResultCalculated(
    int MatchId,
    int Action,
    List<ResourceItem> Resources);

public record ResultRefunded(
    int MatchId,
    string Action,
    List<ResourceItem> Resources);

public record ResultRefundConfirmed();
