using MediatR;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class GetMatchEarlyRequest : IRequest<MatchEarly>
    {
        public int MatchId { get; set; }
    }
}