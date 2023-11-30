namespace Settlement.FastMarkets.Requests;

public class InsertMessageRequest : IRequest<Unit>
{
    public int UserId { get; set; }
    public int MatchId { get; set; }
    public string ActionName { get; set; }
}