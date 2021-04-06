using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MultiSportModel
    {
        public Permission Permission { get; set; }

        public List<SportModel> Sports { get; set; }
    }
}