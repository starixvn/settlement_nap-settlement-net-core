using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class SiteMatch
    {
        public SiteMatchDetail SiteMatchInfo { get; set; }

        public List<ChildMatchTicketInfos> SiteChildMatches { get; set; }

        public List<TicketCounts> TicketCounts { get; set; }
    }
}