using MessagePack;
using System.Collections.Generic;

namespace Settlement.EventManagement.Models.MultiSports
{
    [MessagePackObject]
    public class SportModel
    {
        [Key("id")]
        public int Id { get; set; }

        [Key("name")]
        public string Name { get; set; }

        [Key("leagues")]
        public List<LeagueModel> Leagues { get; set; }
    }
}