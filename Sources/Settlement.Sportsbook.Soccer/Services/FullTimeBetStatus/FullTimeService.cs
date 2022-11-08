using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus
{
    public interface IFullTimeService
    {
        string BetStatusFullTimeWithSemicolon(SettleRequest request);

        bool IsExistRefundHt(bool isRefundHt, string halfTimeBetStatus);

        string RefundHtOnBetStatus(string fullTimeBetStatus);
    }

    public class FullTimeServiceImp : IFullTimeService
    {
        private readonly IGoalRecordService goalRecordService;

        public FullTimeServiceImp(IGoalRecordService goalRecordService)
        {
            this.goalRecordService = goalRecordService;
        }

        public string BetStatusFullTimeWithSemicolon(SettleRequest request)
        {
            var goalRecord = new GoalRecordModel { IsExistFgLg = request.IsExistFgLg };
            var goal = request.GoalRecord.Replace(";", string.Empty);
            goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

            return goalRecord.FullTimeBetStatus;
        }

        public bool IsExistRefundHt(bool isRefundHt, string halfTimeBetStatus)
        {
            return isRefundHt && !halfTimeBetStatus.IgnoreCaseContains(EventStatus.RefundHT);
        }

        public string RefundHtOnBetStatus(string fullTimeBetStatus)
        {
            var goalRecord = new GoalRecordModel
            {
                IsExistRefundHt = true,
                IsExistHalfTime = false
            };

            return $"{goalRecord.HalftimeBetStatus}{fullTimeBetStatus}";
        }
    }
}