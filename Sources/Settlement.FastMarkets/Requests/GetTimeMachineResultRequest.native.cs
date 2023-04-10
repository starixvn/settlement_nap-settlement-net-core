using MediatR;

namespace Settlement.FastMarkets.Requests;

public class GetTimeMachineResultRequest : IRequest<List<TimeMachineResult>>
{
    public int MatchId { get; set; }
}