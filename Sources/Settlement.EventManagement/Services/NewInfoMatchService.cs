namespace Settlement.EventManagement.Services;

using Models;
using Settlement.Core.Services.SpecificService;
using Match = Models.Calculation.Match;
using MultiSportMatch = Models.MultiSports.Match;

public interface NewInfoMatchService
{
    string NewEventStatus(BaseMatch match);

    string EventStatusColor(BaseMatch match);

    string EarlySettlementStatus(BaseMatch match);

    string FastMarketStatus(Match match);

    string ConfirmScore(List<ResultDetail> listResultDetail, string resource);

    bool IsInconsistentScore(string suspenderConfirm, List<ResultDetail> currentResultDetailList, List<ResultDetail> sourceResultDetailList, string resource);

    GoalIcon GoalIcon(Match match);

    void TicketInfo(BaseMatch match);

    bool IsExistsConfirmedEarly(MultiSportMatch match);
}

public class NewInfoMatchServiceImp : NewInfoMatchService
{
    private readonly List<int> eventStatusReasons = new() { 1, 2, 3, 4 };

    private readonly List<string> eventStatusReasonTitles = new()
    {
            EventStatus.IrregularTime1H,
            EventStatus.IrregularTime,
            EventStatus.WrongTeamName,
            EventStatus.Suspended
        };

    private readonly SiteMatchService siteMatchService;

    private readonly GoalIconService goalIconService;

    public NewInfoMatchServiceImp(
        SiteMatchService siteMatchService,
        GoalIconService goalIconService)
    {
        this.siteMatchService = siteMatchService;
        this.goalIconService = goalIconService;
    }

    public string EventStatusColor(BaseMatch match)
    {
        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Postponed))
        {
            return siteMatchService.IsExistMarkedTickets(match)
                ? Background.YellowBlinking
                : Background.Yellow;
        }

        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Completed))
        {
            return siteMatchService.GetBackgroundCompletedStatus(match);
        }

        if (match.Remark.IsPending && match.EventStatus.IgnoreCaseEquals(EventStatus.ResultPending))
        {
            return siteMatchService.IsExistMarkedTickets(match)
                ? Background.BrightYellowBlinking
                : Background.BrightYellow;
        }

        return siteMatchService.IsExistMarkedTickets(match) ? Background.WhiteBlinking : string.Empty;
    }

    public string NewEventStatus(BaseMatch match)
    {
        var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : match.EventStatus;
        if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
        {
            return newEventStatus;
        }

        return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
    }

    public string EarlySettlementStatus(BaseMatch match)
    {
        return siteMatchService.EarlySettlementStatus(match);
    }

    public string FastMarketStatus(Match match)
    {
        return siteMatchService.FastMarketStatus(match);
    }

    public string ConfirmScore(List<ResultDetail> listResultDetail, string resource)
    {
        var resultDetail = listResultDetail.Find(result => result.ResourceId == resource
                                                           && !string.IsNullOrWhiteSpace(result.AwayValue)
                                                           && !string.IsNullOrWhiteSpace(result.HomeValue));

        return resultDetail != null
            ? $"({resultDetail.SourceName}: {resultDetail.HomeValue}-{resultDetail.AwayValue})"
            : string.Empty;
    }

    public bool IsInconsistentScore(string suspenderConfirm, List<ResultDetail> currentResultDetailList, List<ResultDetail> sourceResultDetailList, string resource)
    {
        if (string.Equals(suspenderConfirm, "-"))
        {
            return false;
        }

        var sourceResultDetailByResource = sourceResultDetailList.Find(r => r.ResourceId == resource);

        return sourceResultDetailByResource != null && IsDifferentScore(currentResultDetailList, sourceResultDetailByResource, resource);
    }

    private static bool IsDifferentScore(List<ResultDetail> currentResultDetailList, ResultDetail sourceResultDetail, string resource)
    {
        var resultDetail = currentResultDetailList.Find(r => r.ResourceId == resource);

        return resultDetail == null || (resultDetail.HomeValue != sourceResultDetail.HomeValue || resultDetail.AwayValue != sourceResultDetail.AwayValue);
    }

    public GoalIcon GoalIcon(Match match)
    {
        var goalIconQuery = GoalIconQuery(match);
        return goalIconService.GetGoalIcon(goalIconQuery);
    }

    public void TicketInfo(BaseMatch match)
    {
        match.IsExistMarkedTicket = siteMatchService.IsExistMarkedTickets(match);
        match.IsExistRunningTicket = siteMatchService.IsExistRunningTickets(match);
        match.IsCalculatingSingle = siteMatchService.IsCalculating(match.IsCalculatingSingle, match.SiteMatch.Select(i => i.IsCalculatingSingle).ToList());
        match.IsCalculatingMP = siteMatchService.IsCalculating(match.IsCalculatingMP, match.SiteMatch.Select(i => i.IsCalculatingMP).ToList());
    }

    public bool IsExistsConfirmedEarly(MultiSportMatch match)
    {
        return siteMatchService.IsExistsConfirmedEarly(match);
    }

    private GoalIconQueryModel GoalIconQuery(Match match)
    {
        return new GoalIconQueryModel
        {
            BetStatus = match.BetStatus,
            GoalRecord = match.GoalRecord,
            FinalAwayScore = match.FinalAwayScore,
            FinalHomeScore = match.FinalHomeScore,
            IsExistFgLg = siteMatchService.IsExistFgLg(match),
            IsExistHtFgLg = siteMatchService.IsExistHtFgLg(match)
        };
    }

    private bool IsCheckingEventStatusReasons(BaseMatch match)
    {
        return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
               && eventStatusReasons.Contains(match.EventStatusReason);
    }
}