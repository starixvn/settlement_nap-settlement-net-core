using Settlement.Setting.Models.OutsideSourceManager;

namespace Settlement.Setting.Requests.OutsideSourceManager;

public class GetLeagueOutsideSourceRequest : IRequest<LeagueOutsideSourceModel>
{
    public int LeagueId { get; set; }
}