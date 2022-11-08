using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Models
{
    public class ResultDetail
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

        public int OrdNo { get; set; }

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

        public ResultDetailSetting ResultSettingData => new ResultDetailSetting
        {
            ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse(),
        };

        public List<InputOption> InputOptions { get; set; }

        public int MatchId { get; set; }

        public string HomeName { get; set; }

        public string AwayName { get; set; }

        public string OtherInfo { get; set; }

        public int BetCount { get; set; }

        public int InWaiting { get; set; }

        public int InRunning { get; set; }

        public int BetMarkedCount { get; set; }

        public int BetSettledCount { get; set; }

        public int BetRefundedCount { get; set; }

        public override bool Equals(object obj)
        {
            return obj is ResultDetail result && result.ResourceId == ResourceId;
        }

        public override int GetHashCode()
        {
            return Map;
        }
    }
}