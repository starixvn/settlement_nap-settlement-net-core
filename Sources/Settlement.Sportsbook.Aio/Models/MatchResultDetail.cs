using Kaden.Extensions;
using Settlement.Core.Constants;
using System;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Models
{
    public class MatchResultDetail
    {
        private const int ToBase = 2;

        public string ResourceId { get; set; }

        public string TicketStatus { get; set; }

        public string BetType { get; set; }

        public string BetTypeName { get; set; }

        public string HomeValue { get; set; }

        public string AwayValue { get; set; }

        public byte? ResultStatusId { get; set; }

        public byte SettlementStatusId { get; set; }

        public int GroupId { get; set; }

        public string GroupName { get; set; }

        public int InputType { get; set; }

        public bool IsSpecialBettype { get; set; }

        public int Map { get; set; }

        public virtual string ResultStatus
        {
            get
            {
                return ResultStatusId.ResultName(SettlementStatusId);
            }
        }

        public virtual bool IsNotExistedValue
        {
            get
            {
                return SettlementStatusId == SettlementStatus.Running && string.IsNullOrWhiteSpace(HomeValue) && string.IsNullOrWhiteSpace(AwayValue);
            }
        }

        protected byte ResultSetting { get; set; }

        public MatchResultSetting ResultSettingData => new MatchResultSetting
        {
            ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse(),
        };
    }
}