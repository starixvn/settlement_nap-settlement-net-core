using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class MoveBetRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public int NewMatchId { get; set; }

        public string NewMatchCode { get; set; }

        public string ActionName { get; set; }
    }
}