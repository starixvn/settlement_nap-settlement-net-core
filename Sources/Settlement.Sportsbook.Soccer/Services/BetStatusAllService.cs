using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

public interface IBetStatusAllService
{
    string GetBetStatus(SettleRequest singleQuery);

    string GetBetStatusRefund(RefundRequest request);
}

public class BetStatusAllServiceImp : IBetStatusAllService
{
    private readonly IValidationService validationService;
    private readonly IGoalRecordService goalRecordService;

    public BetStatusAllServiceImp(
        IValidationService validationService,
        IGoalRecordService goalRecordService)
    {
        this.validationService = validationService;
        this.goalRecordService = goalRecordService;
    }

    public string GetBetStatus(SettleRequest singleQuery)
    {
        if (validationService.IsNullScoreAndGoalRecord(singleQuery))
        {
            return NoGoal(singleQuery);
        }

        return validationService.HasFinalScoreAndGoalRecord(singleQuery) ? WithSemicolon(singleQuery) : string.Empty;
    }

    public string GetBetStatusRefund(RefundRequest request)
    {
        if (!request.IsExistFgLg && !request.IsExistHtFgLg)
        {
            return string.Empty;
        }

        if (validationService.IsNullScoreAndGoalRecord(request))
        {
            return NoGoal(request);
        }

        if (validationService.HasHalftimeScoreWithoutSemicolonOnGoalRecord(request))
        {
            return WithoutSemicolon(request);
        }

        return validationService.HasHalftimeScoreWithSemicolonOnGoalRecord(request) ? WithSemicolon(request) : string.Empty;
    }

    private static string NoGoal(SettleBaseRequest singleQuery)
    {
        var goalRecord = new GoalRecordModel
        {
            IsExistFgLg = singleQuery.IsExistFgLg,
            IsExistHtFgLg = singleQuery.IsExistHtFgLg,
            FirstGoal = "0",
            LastGoal = "0"
        };

        return goalRecord.BetStatus;
    }

    private string WithSemicolon(SettleBaseRequest singleQuery)
    {
        var halfTimeBetStatus = BetStatusHalftimeWithSemicolon(singleQuery);
        var fullTimeBetStatus = BetStatusFullTimeWithSemicolon(singleQuery);

        return $"{halfTimeBetStatus}{fullTimeBetStatus}";
    }

    private string WithoutSemicolon(SettleBaseRequest queryModel)
    {
        var firstGoal = goalRecordService.HomeOrAwayFirstGoal(queryModel.GoalRecord);

        var goalRecord = new GoalRecordModel
        {
            IsExistFgLg = queryModel.IsExistFgLg,
            IsExistHtFgLg = queryModel.IsExistHtFgLg,
            FirstGoal = firstGoal,
            LastGoal = "0"
        };

        return goalRecord.BetStatus;
    }

    private string BetStatusHalftimeWithSemicolon(SettleBaseRequest singleQuery)
    {
        var goalRecord = new GoalRecordModel { IsExistHtFgLg = singleQuery.IsExistHtFgLg };
        var goal = singleQuery.GoalRecord.Split(';')[0];
        goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

        return goalRecord.HalftimeBetStatus;
    }

    private string BetStatusFullTimeWithSemicolon(SettleBaseRequest singleQuery)
    {
        var goalRecord = new GoalRecordModel { IsExistFgLg = singleQuery.IsExistFgLg };
        var goal = singleQuery.GoalRecord.Replace(";", string.Empty);
        goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

        return goalRecord.FullTimeBetStatus;
    }
}