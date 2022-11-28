using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class SettleRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public string ActionName { get; set; }

    public string ApiKey { get; set; }

    public bool IsReSettledTickets { get; set; }

    public string BetStatus { get; set; }

    public bool IsLeader { get; set; }

    public int SportType { get; set; }

    public bool IsDirectly { get; set; }

    public List<ResourceItem> SelectedResources { get; set; }

    public string ChildMatchIds { get; set; }

    public int? RefResultStatus { get; set; }
}