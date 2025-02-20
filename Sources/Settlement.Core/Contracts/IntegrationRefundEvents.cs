using Settlement.Core.Models;

namespace AutoEarlyRefund.Contracts;

public record ResultsRefunded(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    List<ResourceItem> Resources
    );

public record ResultsRefundConfirmed(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    List<ResourceItem> Resources
    );

public record ResultsRefundConfirmedSdt(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    List<ResourceItem> Resources
    );

public record MatchCalculated(
    int MatchId,
    int ParentId,
    short ShortType,
    short ChildMatchType,
    int? HalfTimeHomeScore,
    int? HalfTimeAwayScore,
    int? FinalHomeScore,
    int? FinalAwayScore
    );


public record MainMatchCalculated(
    int MatchId,
    int ParentId,
    short ShortType,
    short ChildMatchType,
    int? HalfTimeHomeScore,
    int? HalfTimeAwayScore,
    int? FinalHomeScore,
    int? FinalAwayScore,
    string Action = "Cal"
);


public record ExtraMatchCalculated(
    int MatchId,
    int ParentId,
    short ShortType,
    short ChildMatchType,
    int? HalfTimeHomeScore,
    int? HalfTimeAwayScore,
    int? FinalHomeScore,
    int? FinalAwayScore,
    string Action = "Cal"
);

public record ResultsCalculated(
    int MatchId,
    short ShortType,
    short ChildMatchType,
    List<ResourceItem> Resources);