using Settlement.EventManagement.Models.MultiSports;

namespace Settlement.EventManagement.Requests;

public class RefreshMultiSportRequest : IRequest<IList<Match>>
{
    public string LeagueIds { get; set; }

    public string MatchIds { get; set; }
}