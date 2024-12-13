using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Core.Models;


namespace Settlement.Setting.Requests.OutsideSourceManager;

public class UpdateLeagueOutsideSourceRequest: IRequest<Result>
{
    public int LeagueId { get; set; }

    public List<OutsideSourceResourceItem> Sources { get; set; }
}