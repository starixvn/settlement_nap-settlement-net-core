using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class Match
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetail> ResultDetails { get; set; }

        public List<TicketCounts> TicketCounts { get; set; }

        public List<ChildMatchModel> ChildMatches { get; set; }

        public FantasyMatch FantasyMatch { get; set; }

        public Permission Permission { get; set; }
    }
}