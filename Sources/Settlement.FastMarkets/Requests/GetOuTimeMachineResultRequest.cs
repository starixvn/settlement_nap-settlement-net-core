namespace Settlement.FastMarkets.Requests;

public class GetOuTimeMachineResultRequest : IRequest<List<TimeMachineResult>>
{
    public int MatchId { get; set; }
}