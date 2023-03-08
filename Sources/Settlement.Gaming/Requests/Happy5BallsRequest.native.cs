using MediatR;
using Settlement.Gaming.Models;

namespace Settlement.Gaming.Requests;

public class Happy5BallsRequest : IRequest<List<BallModel>>
{
    public int MatchId { get; set; }
}