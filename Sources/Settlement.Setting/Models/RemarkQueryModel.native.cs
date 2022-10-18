using System;
using System.Collections.Generic;
using Kaden.Extensions;
using Settlement.Core.Models;

namespace Settlement.Setting.Models
{
    public class RemarkQueryModel
    {
        private string eventStatus = string.Empty;
        private string originalEventStatus = string.Empty;
        private AutoCalculationSetting autoCalcSetting;
        private const int ConvertToBase = 2;

        private readonly List<string> eventStatusReasonTitles = new List<string>
        {
            Core.Constants.EventStatus.IrregularTime1H,
            Core.Constants.EventStatus.IrregularTime,
            Core.Constants.EventStatus.WrongTeamName,
            Core.Constants.EventStatus.Suspended,
        };

        private readonly List<int> eventStatusReasons = new List<int> { 1, 2, 3, 4 };

        public string EventStatus
        {
            get
            {
                return eventStatus.MapToString(BetStatus, Remark.IsPending);
            }

            set
            {
                originalEventStatus = value;
                eventStatus = value;
            }
        }

        public string NewEventStatus
        {
            get => originalEventStatus.IgnoreCaseEquals(Core.Constants.EventStatus.Running) &&
                eventStatusReasons.Contains(EventStatusReason ?? 0) ? eventStatusReasonTitles[(int)EventStatusReason - 1] : EventStatus;
        }

        protected byte SettlementStatus { get; set; }

        protected string BetStatus { get; set; }

        public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);

        public int? EventStatusReason { get; set; }

        public int AutoSetting { get; set; }

        public AutoCalculationSetting AutoCalcSetting => autoCalcSetting ?? (autoCalcSetting = new AutoCalculationSetting
        {
            MatchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse()
        });
    }
}