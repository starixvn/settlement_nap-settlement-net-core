using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class RefundParlayRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }
    }
}