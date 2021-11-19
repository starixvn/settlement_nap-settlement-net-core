using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class Match
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetail> ResultDetail { get; set; }

        public List<TicketCountModel> TicketCount { get; set; }

        public List<ChildMatchModel> ChildMatch { get; set; }

        public FantasyMatch FantasyMatch { get; set; }

        public Permission Permission { get; set; }
    }
}