using MessagePack;
using System.Collections.Generic;

namespace Settlement.EventManagement.Models.Calculation
{
    [MessagePackObject]
    public class League
    {
        [Key("leagueId")]
        public int LeagueId { get; set; }

        [Key("name")]
        public string Name { get; set; }

        [Key("matches")] public List<Match> Matches { get; set; } = new List<Match>();
    }
}