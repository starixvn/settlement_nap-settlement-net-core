using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MatchesBySportTypeModel
    {
        public int SportType { get; set; }

        public List<MatchMoveTicket> Matches { get; set; }
    }
}
