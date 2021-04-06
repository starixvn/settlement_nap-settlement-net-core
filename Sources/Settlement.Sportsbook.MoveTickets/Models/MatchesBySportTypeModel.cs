using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MatchesBySportTypeModel
    {
        public int SportType { get; set; }

        public List<Match> Matches { get; set; }
    }
}