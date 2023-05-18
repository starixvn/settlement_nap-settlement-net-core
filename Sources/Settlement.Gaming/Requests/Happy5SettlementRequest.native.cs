using MediatR;
using Settlement.Core.Models;
using Settlement.Gaming.Models;

namespace Settlement.Gaming.Requests;

public class Happy5SettlementRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int UserId { get; set; }

    public List<BallModel> Balls { get; set; }

    public string Action { get; set; }

    public Permission Permission { get; set; }
}