using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

public interface IBetStatusService
{
    string GetBetStatus(SettleBaseRequest request);

    string RevertBetStatus(UncalculateFtRequest request, string betStatus, string oldBetStatus, string goalRecord);
}

public class BetStatusServiceImp : IBetStatusService
{
    private readonly IHalftimeService halftimeService;

    public BetStatusServiceImp(IHalftimeService halftimeService)
    {
        this.halftimeService = halftimeService;
    }

    public string GetBetStatus(SettleBaseRequest request)
    {
        var halfTimeBetStatus = string.Empty;
        if (request.IsExistHtFgLg)
        {
            halfTimeBetStatus = halftimeService.GetBetStatusForCalculateHalfTime(request);
        }

        var betStatus = halftimeService.AppendHalfTimeBetStatus(request.BetStatus, halfTimeBetStatus);

        if (request.IsExistFgNg)
        {
            var fullTimeBetStatus = halftimeService.FullTimeBetStatusForCalculateHalfTime(request.GoalRecord);

            return halftimeService.AppendFullTimeBetStatus(betStatus, fullTimeBetStatus);
        }

        return betStatus;
    }

    public string RevertBetStatus(UncalculateFtRequest request, string betStatus, string oldBetStatus, string goalRecord)
    {
        var halfTimeBetStatus = string.Empty;
        if (request.IsExistHtFgLg)
        {
            halfTimeBetStatus = halftimeService.RevertBetStatusForCalculateHalfTime(oldBetStatus);
        }

        betStatus = halftimeService.AppendHalfTimeBetStatus(betStatus, halfTimeBetStatus);

        if (request.IsExistFgNg)
        {
            var fullTimeBetStatus = halftimeService.FullTimeBetStatusForCalculateHalfTime(goalRecord);

            return halftimeService.AppendFullTimeBetStatus(betStatus, fullTimeBetStatus);
        }

        return betStatus;
    }
}