using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class NetPositionRequest
{
    public bool IsHedgeMatch { get; set; }

    public int MatchId { get; set; }

    public string Action { get; set; }

    public List<ResultCommand> ResultCommand { get; set; }
}