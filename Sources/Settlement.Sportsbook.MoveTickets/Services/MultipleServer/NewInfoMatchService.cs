namespace Settlement.Sportsbook.MoveTickets.Services.MultipleServer;

using Constants;
using Settlement.Core.Constants;
using Settlement.Core.Models;

public interface NewInfoMatchService
{
    string NewEventStatus(Match match);

    string EventStatusColor(Match match);

    string EarlySettlementStatus(Match match);
}

public class NewInfoMatchServiceImp(SiteMatchService siteMatchService) : NewInfoMatchService
{
    private readonly List<int> eventStatusReasons = [1, 2, 3, 4];

    private readonly List<string> eventStatusReasonTitles =
    [
        EventStatus.IrregularTime1H,
        EventStatus.IrregularTime,
        EventStatus.WrongTeamName,
        EventStatus.Suspended
    ];

    public string EventStatusColor(Match match)
    {
        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Postponed))
        {
            return match.IsExistMarkedTicket
                ? Background.YellowBlinking
                : Background.Yellow;
        }

        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Completed))
        {
            return siteMatchService.GetBackgroundCompletedStatus(match);
        }

        if (match.Remark.IsPending && match.EventStatus.IgnoreCaseEquals(EventStatus.ResultPending))
        {
            return match.IsExistMarkedTicket
                ? Background.BrightYellowBlinking
                : Background.BrightYellow;
        }

        return match.IsExistMarkedTicket ? Background.WhiteBlinking : string.Empty;
    }

    public string NewEventStatus(Match match)
    {
        var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : match.EventStatus;
        if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
        {
            return newEventStatus;
        }

        return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
    }

    public string EarlySettlementStatus(Match match)
    {
        return siteMatchService.EarlySettlementStatus(match);
    }

    private bool IsCheckingEventStatusReasons(Match match)
    {
        return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
               && eventStatusReasons.Contains(match.EventStatusReason);
    }
}