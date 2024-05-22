using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

public interface IBetStatusService
{
    string GetBetStatus(SettleBaseRequest request);
}

public class BetStatusServiceImp(IHalftimeService halftimeService) : IBetStatusService
{
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
}