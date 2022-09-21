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
        
    }
}