using Settlement.Models;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class CheckRunningOddsRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public List<CheckOddsItem> SelectedResources { get; set; }

    public string Action { get; set; }
}