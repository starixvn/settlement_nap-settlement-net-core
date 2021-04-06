using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class CheckRunningOddsRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public string Action { get; set; }
    }
}
