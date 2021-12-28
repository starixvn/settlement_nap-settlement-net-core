using System;
using Kaden.Extensions;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class ChildMatchModel
    {
        private const int IsRefundPosition = 5;

        private const int IsPendingPosition = 0;

        private const int ToBase = 2;

        private string eventStatus = string.Empty;

        public string MatchCode { get; set; }

        public int MatchId { get; set; }

        public string BetStatus { get; set; }

        public byte SettlementStatus { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public bool IsExistRunningTicket { get; set; }

        private string SettlementStatusText => Convert.ToString(SettlementStatus, ToBase).Reverse();

        public string IsRefund => !string.IsNullOrWhiteSpace(SettlementStatusText) && SettlementStatusText.Length > IsRefundPosition && SettlementStatusText[IsRefundPosition].Equals('1')
            ? "YES" : "NO";

        public bool IsPending => !string.IsNullOrWhiteSpace(SettlementStatusText) && SettlementStatusText.Length > IsPendingPosition && SettlementStatusText[IsPendingPosition].Equals('1');

        public string EventStatus
        {
            get
            {
                return eventStatus.MapToString(BetStatus, IsPending);
            }

            set
            {
                eventStatus = value;
            }
        }
    }
}