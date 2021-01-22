using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class SettleRequest : IRequest<Result>
    {
        public int MatchId { get; set; }
    }
}
