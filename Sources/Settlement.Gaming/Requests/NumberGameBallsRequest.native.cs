using MediatR;
using Settlement.Gaming.Models;

namespace Settlement.Gaming.Requests;

public class NumberGameBallsRequest : IRequest<List<BallModel>>
{
    public int MatchId { get; set; }
}