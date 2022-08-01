using System;
using System.Collections.Generic;
using Kaden.Extensions;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class ResultDetailModel
    {
        private const int ToBase = 2;

        public string ResourceId { get; set; }

        public string TicketStatus { get; set; }

        public int Map { get; set; }

        public string BetType { get; set; }

        public string BetTypeName { get; set; }

        public string HomeValue { get; set; }

        public string AwayValue { get; set; }

        public byte? ResultStatusId { get; set; }

        public byte SettlementStatusId { get; set; }

        public virtual string ResultStatus => ResultStatusId.ResultName(SettlementStatusId);

        protected byte ResultSetting { get; set; }

        public List<string> MultipleTicketStatus { get; set; }

        public ResultDetailSetting ResultSettingData => new ResultDetailSetting
        {
            ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse(),
        };

        public override bool Equals(object obj)
        {
            return obj is ResultDetailModel result && result.ResourceId == ResourceId;
        }
    }
}
