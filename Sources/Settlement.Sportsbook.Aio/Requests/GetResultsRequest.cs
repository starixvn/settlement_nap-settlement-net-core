using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public record class GetResultsRequest(int MatchId) : IRequest<AioMatch>;