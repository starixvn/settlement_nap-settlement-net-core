namespace Settlement.Sportsbook.Aio.Requests;

public class UpdateSettlementResultHistoryStatusRequest : IRequest<bool>
{
    public int MatchId { get; set; }
    public string SessionIds { get; set; }
    public bool IsOrg { get; set; }
    public short SportType { get; set; }
}