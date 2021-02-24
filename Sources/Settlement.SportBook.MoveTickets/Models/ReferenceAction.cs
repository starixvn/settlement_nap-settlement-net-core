namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class ReferenceAction
    {
        public int MatchId { get; set; }

        public int ActionId { get; set; }

        public bool IsFailed { get; set; }

        public string LogDate { get; set; }

        public string LogId { get; set; }
    }
}