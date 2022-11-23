using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class GetRecalResultRequest : IRequest<List<ResultDetail>>
{
    public int MatchId { get; set; }

    public int SportType { get; set; }
}