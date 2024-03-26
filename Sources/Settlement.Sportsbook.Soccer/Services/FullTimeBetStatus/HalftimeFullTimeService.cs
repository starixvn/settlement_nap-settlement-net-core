using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

public interface IHalftimeFullTimeService
{
    string HalfTimeBetStatus(SettleBaseRequest request);

    string FullTimeBetStatus(SettleBaseRequest request, string halfTimeBetStatus);
}

public class HalftimeFullTimeServiceImp(IGoalRecordService goalRecordService, IFullTimeService fullTimeService)
    : IHalftimeFullTimeService
{
    public string HalfTimeBetStatus(SettleBaseRequest request)
    {
        var isExistRefundHt = request.BetStatus.IgnoreCaseContains(EventStatus.RefundHt);
        return isExistRefundHt
            ? BetStatusHalftimeWithIsExistRefundHt(request)
            : BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(request);
    }

    public string FullTimeBetStatus(SettleBaseRequest request, string halfTimeBetStatus)
    {
        var isExistRefundHt = request.BetStatus.IgnoreCaseContains(EventStatus.RefundHt);
        var fullTimeBetStatus = fullTimeService.BetStatusFullTimeWithSemicolon(request);

        return fullTimeService.IsExistRefundHt(isExistRefundHt, halfTimeBetStatus)
            ? fullTimeService.RefundHtOnBetStatus(fullTimeBetStatus)
            : fullTimeBetStatus;
    }

    private static string BetStatusHalftimeWithIsExistRefundHt(SettleBaseRequest request)
    {
        var isExistHalfTime = request.BetStatus.IgnoreCaseContains("1FL");

        var goalRecord = new GoalRecordModel
        {
            IsExistRefundHt = true,
            IsExistHalfTime = isExistHalfTime,
            FirstGoal = "0",
            LastGoal = "0"
        };

        return goalRecord.HalftimeBetStatus;
    }

    private string BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(SettleBaseRequest request)
    {
        var goal = request.GoalRecord.Split(';')[0];
        var goalRecord = new GoalRecordModel { IsExistHtFgLg = true };
        goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

        return goalRecord.HalftimeBetStatus;
    }
}