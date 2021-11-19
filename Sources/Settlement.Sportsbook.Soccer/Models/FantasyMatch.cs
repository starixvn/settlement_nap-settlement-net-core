using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class FantasyMatch
    {
        public FantasyMatchDetail FantasyMatchDetail { get; set; }

        public List<FantasyRelatedMatch> RelatedMatches { get; set; }
    }
}