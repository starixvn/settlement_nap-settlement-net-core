namespace Settlement.FastMarkets.Models
{
    public class FastMarketTicketDetail
    {
        public int BetType { get; set; }

        public int Position { get; set; }

        public int TicketCount { get; set; }

        public int TicketRunning { get; set; }

        public int TicketMarked { get; set; }

        public override bool Equals(object obj)
        {
            return obj is FastMarketTicketDetail result && result.BetType == BetType && result.Position == Position;
        }
    }
}