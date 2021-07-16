using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.Requests
{
    public class GetLastestResultRequest : IRequest<MatchDetail>
    {
        public int MatchId { get; set; }
    }
}