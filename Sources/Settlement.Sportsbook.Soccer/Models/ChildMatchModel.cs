using System;
using Kaden.Extensions;
using Settlement.Core.Constants;

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

        private bool IsPending => !string.IsNullOrWhiteSpace(SettlementStatusText) && SettlementStatusText.Length > IsPendingPosition && SettlementStatusText[IsPendingPosition].Equals('1');

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

        public string EventStatusColor
        {
            get
            {
                if (EventStatus.IgnoreCaseEquals(Constants.EventStatus.PostPoned))
                {
                    return IsExistMarkedTicket ? Background.YellowBlinking : Background.Yellow;
                }

                if (EventStatus.IgnoreCaseEquals(Constants.EventStatus.Completed))
                {
                    return GetBackgroundCompletedStatus;
                }

                if (IsPending && EventStatus.IgnoreCaseEquals(EventStatusExtensions.ResultPending))
                {
                    return IsExistMarkedTicket ? Background.BrightYellowBlinking : Background.BrightYellow;
                }

                return IsExistMarkedTicket ? Background.WhiteBlinking : string.Empty;
            }
        }

        private string GetBackgroundCompletedStatus
        {
            get
            {
                return IsOnlyMarkedTicket
                    ? Background.WhiteBlinking
                    : GetBackgroundRunningTicket;
            }
        }

        private string GetBackgroundRunningTicket
        {
            get
            {
                if (IsExistRunningTicket)
                {
                    return IsExistMarkedTicket ? Background.PinkBlinking : Background.Pink;
                }

                return string.Empty;
            }
        }

        private bool IsOnlyMarkedTicket => IsExistMarkedTicket && !IsExistRunningTicket;
    }
}