using MediatR;
using Settlement.Gaming.Models;
using System.Collections.Generic;

namespace Settlement.Gaming.Requests;

public class NumberGameBallsRequest : IRequest<List<BallModel>>
{
    public int MatchId { get; set; }
}