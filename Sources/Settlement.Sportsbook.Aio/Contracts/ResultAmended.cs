using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;

namespace ResultAmendment.Contracts; // context for publish and subscribe

public record class ResultAmended(
    int MatchId,
    string BroadcastSessionId,
    int SportType,
    string Action,
    List<ResourceItem> SelectedResources,
    List<ResultChanged> ResultsChanged);

