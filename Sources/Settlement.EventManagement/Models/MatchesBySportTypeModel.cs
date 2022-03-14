using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Models
{
    internal class MatchesBySportTypeModel
    {
        public int SportType { get; set; }

        public List<Match> Matches { get; set; }
    }
}