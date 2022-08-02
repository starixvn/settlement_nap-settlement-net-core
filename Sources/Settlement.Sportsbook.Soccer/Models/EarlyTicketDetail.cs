namespace Settlement.Sportsbook.Soccer.Models
{
    public class EarlyTicketDetail
    {
        public string ResourceId { get; set; }

        public int InRunning { get; set; }

        public int InWaiting { get; set; }

        public int BetMarkedCount { get; set; }

        public int BetCount { get; set; }
    }
}
