using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class RefundParlayChildMatchRequest : IRequest<Result>
    {
        public string MatchIds { get; set; }

        public string ActionName { get; set; }
    }
}