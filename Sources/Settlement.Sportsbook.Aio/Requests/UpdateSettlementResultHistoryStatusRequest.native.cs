namespace Settlement.Sportsbook.Aio.Requests;

public class UpdateSettlementResultHistoryStatusRequest : IRequest<bool>
{
    public int MatchId { get; set; }
    public string SessionIds { get; set; }
}