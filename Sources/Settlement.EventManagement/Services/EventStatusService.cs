using Microsoft.VisualBasic;

namespace Settlement.EventManagement.Services;

using Models;

public interface EventStatusService
{
    string CheckProcessingStatus(string eventStatus, BaseMatch match);
}

public class EventStatusServiceImp : EventStatusService
{
    private readonly List<string> eventStatusReasonTitles = new()
    {
        EventStatus.IrregularTime1H,
        EventStatus.IrregularTime,
        EventStatus.WrongTeamName,
        EventStatus.Suspended
    };

    private readonly List<int> eventStatusReasons = new() { 1, 2, 3, 4 };

    public string CheckProcessingStatus(string eventStatus, BaseMatch match)
    {
        var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : eventStatus;
        if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
        {
            return newEventStatus;
        }

        return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
    }

    private bool IsCheckingEventStatusReasons(BaseMatch match)
    {
        return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
               && eventStatusReasons.Contains(match.EventStatusReason);
    }
}