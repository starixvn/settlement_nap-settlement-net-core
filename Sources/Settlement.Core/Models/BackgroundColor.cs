using Kaden.Extensions;
using Settlement.Core.Constants;
using System;
using System.Linq;

namespace Settlement.Core.Models
{
    public class BackgroundColor
    {
        public int SportType { get; set; }

        public bool IsCalRefund { get; set; }

        public bool IsHalfTimeCal { get; set; }

        public bool IsCalculated { get; set; }

        public bool IsMultiCaled { get; set; }

        public bool IsRefund { get; set; }

        public string EarlySettleStatus { get; set; }

        public string AutoSettleFastMarket { get; set; }

        public int AutoSetting { get; set; }

        public string EventStatus { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public bool IsExistRunningTicketParlay { get; set; }

        public string MatchNameColor => SportType == Constants.SportType.MuayThai ? Background.MuayThai : string.Empty;

        public string CalcSbBackgroundColor
        {
            get
            {
                if (IsCalculated)
                {
                    return Background.Calculated;
                }
                else if (IsCalRefund)
                {
                    return Background.Refund;
                }
                else if (IsHalfTimeCal)
                {
                    return Background.Pink;
                }
                else
                {
                    return string.Empty;
                }
            }
        }

        public string HalfTimeColor => IsHalfTimeCal ? Background.Calculated : string.Empty;

        public string FullTimeColor => IsCalculated ? Background.Calculated : string.Empty;

        public string EarlySettleBackground => GetBackground(EarlySettleStatus, EventStatus);

        public string FastMarketBackground
        {
            get
            {
                var fastMarketMatchSetting = Convert.ToString(AutoSetting, 2).Reverse();
                var enableFastMarket = !string.IsNullOrWhiteSpace(fastMarketMatchSetting) && fastMarketMatchSetting.Length > 2 && fastMarketMatchSetting[2].Equals('1');

                return enableFastMarket
                    ? GetBackground(AutoSettleFastMarket, EventStatus)
                    : FastMarketBlinking(AutoSettleFastMarket, EventStatus);
            }
        }

        public string CalcMpBackgroundColor
        {
            get
            {
                if (IsExistMarkedTicketParlay)
                {
                    return Background.WhiteBlinking;
                }
                if (IsMultiCaled != IsRefund)
                {
                    var colorCalculated = IsExistRunningTicketParlay ? Background.Pink : Background.Calculated;
                    return IsMultiCaled ? colorCalculated : Background.Refund;
                }

                return string.Empty;
            }
        }

        private static string GetBackground(string currentStatus, string eventStatus)
        {
            var isRunning = currentStatus != null && currentStatus.IgnoreCaseEquals(Constants.EventStatus.Running)
                                && eventStatus.IgnoreCaseEquals(Constants.EventStatus.Completed);
            return isRunning
                ? Background.AutoSettleRunning
                : CalculatedBackground(currentStatus);
        }

        private static string CalculatedBackground(string currentStatus)
        {
            var isCompleted = currentStatus != null && currentStatus.IgnoreCaseEquals(Constants.EventStatus.Completed);

            return isCompleted ? Background.Calculated : string.Empty;
        }

        private static string FastMarketBlinking(string currentStatus, string eventStatus)
        {
            var isRunning = currentStatus != null && currentStatus.IgnoreCaseEquals(Constants.EventStatus.Running);

            return isRunning ? BlinkingBackground(eventStatus) : CalculatedBackground(currentStatus);
        }

        private static string BlinkingBackground(string eventStatus)
        {
            var isCompleted = eventStatus.IgnoreCaseEquals(Constants.EventStatus.Completed);

            return isCompleted ? Background.AutoSettleCompletedBlinking : Background.AutoSettleRunningBlinking;
        }
    }
}