using System.Text;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class ScoreSetModel
    {
        public StringBuilder BetStatus { get; set; } = new StringBuilder();

        public int? HtHomeScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? HtAwayScore { get; set; }

        public int? FinalAwayScore { get; set; }
    }
}