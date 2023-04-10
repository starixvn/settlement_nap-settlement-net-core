using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

public interface IHalftimeFullTimeService
{
    string HalfTimeBetStatus(SettleRequest request);

    string FullTimeBetStatus(SettleRequest request, string halfTimeBetStatus);
}

public class HalftimeFullTimeServiceImp : IHalftimeFullTimeService
{
    private readonly IGoalRecordService goalRecordService;

    private readonly IFullTimeService fullTimeService;

    public HalftimeFullTimeServiceImp(IGoalRecordService goalRecordService, IFullTimeService fullTimeService)
    {
        this.goalRecordService = goalRecordService;
        this.fullTimeService = fullTimeService;
    }

    public string HalfTimeBetStatus(SettleRequest request)
    {
        var isExistRefundHt = request.BetStatus.IgnoreCaseContains(EventStatus.RefundHt);
        return isExistRefundHt
            ? BetStatusHalftimeWithIsExistRefundHt(request)
            : BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(request);
    }

    public string FullTimeBetStatus(SettleRequest request, string halfTimeBetStatus)
    {
        var isExistRefundHt = request.BetStatus.IgnoreCaseContains(EventStatus.RefundHt);
        var fullTimeBetStatus = fullTimeService.BetStatusFullTimeWithSemicolon(request);

        return fullTimeService.IsExistRefundHt(isExistRefundHt, halfTimeBetStatus)
            ? fullTimeService.RefundHtOnBetStatus(fullTimeBetStatus)
            : fullTimeBetStatus;
    }

    private static string BetStatusHalftimeWithIsExistRefundHt(SettleRequest request)
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

    private string BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(SettleRequest request)
    {
        var goal = request.GoalRecord.Split(';')[0];
        var goalRecord = new GoalRecordModel { IsExistHtFgLg = true };
        goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

        return goalRecord.HalftimeBetStatus;
    }
}