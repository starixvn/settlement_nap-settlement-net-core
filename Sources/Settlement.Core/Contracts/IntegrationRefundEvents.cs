using Settlement.Core.Models;

namespace AutoEarlyRefund.Contracts;

public record ResultsRefunded(
    int MatchId,
    int LeagueId,
    short ShortType,
    short ChildMatchType,
    string Action,
    List<ResourceItem> Resources
    );

public record ResultsRefundConfirmed(
    int MatchId
    ,
    int LeagueId,
    short ShortType,
    short ChildMatchType,
    string Action,
    int Type,
    List<ResourceItem> Resources
    );