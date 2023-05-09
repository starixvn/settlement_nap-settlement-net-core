using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

public interface IScoreAndGoalService
{
    string ReplaceBetStatusWhenScoreAndGoalRecordIsNull(string betStatus);

    string BetStatusHasFinalScoreAndGoalRecord(SettleRequest request);
}

public class ScoreAndGoalServiceImp : IScoreAndGoalService
{
    private readonly IHalftimeFullTimeService halftimeFullTimeService;
    private readonly FirstLastGoalService firstLastGoalService;

    public ScoreAndGoalServiceImp(IHalftimeFullTimeService halftimeFullTimeService, FirstLastGoalService firstLastGoalService)
    {
        this.halftimeFullTimeService = halftimeFullTimeService;
        this.firstLastGoalService = firstLastGoalService;
    }

    public string ReplaceBetStatusWhenScoreAndGoalRecordIsNull(string betStatus)
    {
        var isExistHalfTimeFirstGoalLastGoal = betStatus.IgnoreCaseContains("1FL");
        return isExistHalfTimeFirstGoalLastGoal
            ? firstLastGoalService.FirstGoalOnBetStatus(betStatus)
            : firstLastGoalService.LastGoalOnBetStatus(betStatus);
    }

    public string BetStatusHasFinalScoreAndGoalRecord(SettleRequest request)
    {
        var halfTimeBetStatus = string.Empty;
        var fullTimeBetStatus = string.Empty;

        if (request.IsExistHtFgLg)
        {
            halfTimeBetStatus = halftimeFullTimeService.HalfTimeBetStatus(request);
        }

        if (request.IsExistFgLg)
        {
            fullTimeBetStatus = halftimeFullTimeService.FullTimeBetStatus(request, halfTimeBetStatus);
        }

        return $"{halfTimeBetStatus}{fullTimeBetStatus}";
    }
}