using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class RefundParlayRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }
    }
}
