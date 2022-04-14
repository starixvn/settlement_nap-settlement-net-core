using MessagePack;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.EventManagement.Models
{
    [MessagePackObject]
    public class LeagueModel
    {
        [Key("leagueId")]
        public int LeagueId { get; set; }

        [Key("name")]
        public string Name { get; set; }

        [Key("matches")]
        public List<MultiSportMatch> Matches { get; set; }

        [Key("sportType")]
        public int SportType { get; set; }

        [Key("isMergedParlay")]
        public bool IsMergedParlay
        {
            get
            {
                return Matches.Any(match => match.IsMergedParlay);
            }
        }
    }
}