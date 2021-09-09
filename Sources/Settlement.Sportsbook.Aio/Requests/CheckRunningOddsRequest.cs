using System.Collections.Generic;
using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class CheckRunningOddsRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public List<CheckOddsItem> SelectedMatchResource { get; set; }

        public string Action { get; set; }
    }
}