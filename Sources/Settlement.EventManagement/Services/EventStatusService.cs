namespace Settlement.EventManagement.Services;

using Constants;
using Models;

public interface EventStatusService
{
    string AdjustEventStatusAbandoned(string eventStatus, IEnumerable<ResultDetail> resultDetails, int sportType);

    string CheckProcessingStatus(string eventStatus, BaseMatch match);
}

public class EventStatusServiceImp : EventStatusService
{
    private const string Abandoned = "Abandoned";

    private readonly List<string> eventStatusReasonTitles = new()
    {
        EventStatus.IrregularTime1H,
        EventStatus.IrregularTime,
        EventStatus.WrongTeamName,
        EventStatus.Suspended
    };

    private readonly List<int> eventStatusReasons = new() { 1, 2, 3, 4 };

    public string AdjustEventStatusAbandoned(string eventStatus, IEnumerable<ResultDetail> resultDetails, int sportType)
    {
        if (resultDetails == null)
        {
            return eventStatus;
        }

        var resultDetailSorted = resultDetails.OrderBy((resultDetail) =>
            ResourcePosition.ResourceBySport[sportType].IndexOf(resultDetail.ResourceId)).ToList();

        var statusRound = GetStatusRound(eventStatus, resultDetailSorted);
        return statusRound == eventStatus ? GetStatusFinal(eventStatus, resultDetailSorted) : statusRound;
    }

    public string CheckProcessingStatus(string eventStatus, BaseMatch match)
    {
        var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : eventStatus;
        if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
        {
            return newEventStatus;
        }

        return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
    }

    private static string GetStatusRound(string eventStatus, IEnumerable<ResultDetail> resultDetails)
    {
        var resultRounds = resultDetails.Where(resultDetail => resultDetail.ResourceId is not (ResourceType.Final or ResourceType.Halftime));
        var firstResultAbandoned = resultRounds.FirstOrDefault(item => item.SettlementStatusId == SettlementStatus.Abandoned);
        return firstResultAbandoned != null ? $"{Abandoned} {firstResultAbandoned.ResourceId}" : eventStatus;
    }

    private static string GetStatusFinal(string eventStatus, IEnumerable<ResultDetail> resultDetails)
    {
        var resultFinal = resultDetails.Where(resultDetail => resultDetail.ResourceId is ResourceType.Final or ResourceType.Halftime);
        var finalResultAbandoned = resultFinal.FirstOrDefault(item => item.SettlementStatusId == SettlementStatus.Abandoned);
        if (finalResultAbandoned == null)
        {
            return eventStatus;
        }
        var resource = finalResultAbandoned.ResourceId == ResourceType.Halftime ? "HT" : "FT";
        return $"{Abandoned} {resource}";
    }

    private bool IsCheckingEventStatusReasons(BaseMatch match)
    {
        return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
               && eventStatusReasons.Contains(match.EventStatusReason);
    }
}