namespace Settlement.Sportsbook.Soccer.Models
{
    public class TicketCountModel
    {
        private const int HalftimeTitle = 1;

        private const int FullTimeTitle = 2;

        private const int EarlySettleTitle = 8;

        private const int FastMarketTitle = 9;

        public int GroupId { get; set; }

        public string GroupName
        {
            get
            {
                switch (GroupId)
                {
                    case HalftimeTitle:
                        return "HT Tickets";

                    case FullTimeTitle:
                        return "FT Tickets";

                    case EarlySettleTitle:
                        return "Early Settle Tickets";

                    case FastMarketTitle:
                        return "Fast Market Tickets";

                    default:
                        return "Total Tickets";
                }
            }
        }

        public int BetRunningCount { get; set; }

        public int BetSettledCount { get; set; }

        public int BetMarkedCount { get; set; }
    }
}