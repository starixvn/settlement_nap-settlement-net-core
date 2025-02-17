using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Contracts;

public record class ResultAmended(
    int MatchId,
    string BroadcastSessionId,
    int SportType,
    string Action,
    List<ResourceItem> SelectedResources,
    List<ResultChanged> ResultsChanged);