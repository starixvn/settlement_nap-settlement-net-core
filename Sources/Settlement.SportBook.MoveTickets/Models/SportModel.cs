using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class SportModel
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public List<LeagueModel> Leagues { get; set; }
    }
}
