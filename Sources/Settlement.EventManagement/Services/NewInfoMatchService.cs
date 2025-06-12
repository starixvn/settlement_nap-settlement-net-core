namespace Settlement.EventManagement.Services;

using Criteria;
using Models;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Core.Services.SpecificService;
using System.Threading.Tasks;
using Match = Models.Calculation.Match;
using MultiSportMatch = Models.MultiSports.Match;

public interface NewInfoMatchService
{
    string NewEventStatus(BaseMatch match, IEnumerable<ResultDetail> resultDetails = null);

    string EventStatusColor(BaseMatch match);

    string OSEventStatusColor(BaseMatch match);

    string EarlySettlementStatus(BaseMatch match);

    string EarlyOSSettlementStatus(BaseMatch match);

    string FastMarketStatus(Match match);

    string ConfirmScore(List<ResultDetail> sourceResults, string resource);
    string ConfirmSoccerScore(List<ResultDetail> sourceResults, List<ResultDetail> resultDetails, string resource);

    bool IsInconsistentScore(string suspenderConfirm, List<ResultDetail> currentResultDetailList, List<ResultDetail> sourceResultDetailList, string resource);

    GoalIcon GoalIcon(Match match);

    void TicketInfo(BaseMatch match);

    bool IsExistsConfirmedEarly(MultiSportMatch match);

    Task<(IEnumerable<MatchStatusModel>, IEnumerable<FailedAutoResource>)> GetAutoPayoutStatus(List<int> matchesIds);

}

public class NewInfoMatchServiceImp(
    SiteMatchService siteMatchService,
    GoalIconService goalIconService,
    EventStatusService eventStatusService,
    AdjustEventStatusService adjustEventStatusService,
    IDynamicRepository repository,
    PermissionService permission)
    : NewInfoMatchService
{
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

        if (match.Remark.IsPending)
        {
            return siteMatchService.IsExistMarkedTickets(match)
                ? Background.BrightYellowBlinking
                : Background.BrightYellow;
        }

        return siteMatchService.IsExistMarkedTickets(match) ? Background.WhiteBlinking : string.Empty;
    }

    public string OSEventStatusColor(BaseMatch match)
    {
        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Postponed))
        {
            return match.IsExistMarkedTicket
                ? Background.YellowBlinking
                : Background.Yellow;
        }

        if (match.EventStatus.IgnoreCaseEquals(EventStatus.Completed))
        {
            return siteMatchService.GetOSBackgroundCompletedStatus(match);
        }

        if (match.Remark.IsPending)
        {
            return match.IsExistMarkedTicket
                ? Background.BrightYellowBlinking
                : Background.BrightYellow;
        }
        return match.IsExistMarkedTicket ? Background.WhiteBlinking : string.Empty;
    }

    public string NewEventStatus(BaseMatch match, IEnumerable<ResultDetail> resultDetails = null)
    {
        var eventStatus = SportGroup.SupportSettleDetermine.Contains(match.SportType)
            ? adjustEventStatusService.EventStatusAbandoned(match.EventStatus, resultDetails, match.SportType)
            : match.EventStatus;

        return eventStatusService.CheckProcessingStatus(eventStatus, match);
    }

    public string EarlySettlementStatus(BaseMatch match)
    {
        return siteMatchService.EarlySettlementStatus(match);
    }

    public string EarlyOSSettlementStatus(BaseMatch match)
    {
        return siteMatchService.EarlyOSSettlementStatus(match);
    }

    public string FastMarketStatus(Match match)
    {
        return siteMatchService.FastMarketStatus(match);
    }

    public string ConfirmScore(List<ResultDetail> sourceResults, string resource)
    {
        var sourceResult = sourceResults.Find(result => result.ResourceId == resource && IsValidResult(result));

        return sourceResult != null
            ? $"({sourceResult.SourceName}: {sourceResult.HomeValue}-{sourceResult.AwayValue})"
            : string.Empty;

    }

    public string ConfirmSoccerScore(List<ResultDetail> sourceResults, List<ResultDetail> resultDetails, string resource)
    {
        var sourceResult = sourceResults.Find(result => result.ResourceId == resource && IsValidResult(result));
        var resultDetail = resultDetails.Find(result => result.ResourceId == resource && IsValidResult(result));
        Fanex.Logging.LogService.InfoAsync(sourceResult?.ToString());

        var isSettled = resultDetail?.ResultStatusId == ResultStatus.ManuallySettled
            || resultDetail?.ResultStatusId == ResultStatus.AutoSettled;

        var score = sourceResult != null
            ? $"({sourceResult.SourceName}: {sourceResult.HomeValue}-{sourceResult.AwayValue})"
            : string.Empty;

        if (isSettled)
        {
            return score;
        }

        if (!permission.Permission.IsLeader)
        {
            return string.Empty;
        }

        return score;
    }

    private bool IsValidResult(ResultDetail resultDetail)
        => !string.IsNullOrWhiteSpace(resultDetail.AwayValue)
                && !string.IsNullOrWhiteSpace(resultDetail.HomeValue);

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

        return resultDetail == null || resultDetail.HomeValue != sourceResultDetail.HomeValue || resultDetail.AwayValue != sourceResultDetail.AwayValue;
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


    public async Task<(IEnumerable<MatchStatusModel>, IEnumerable<FailedAutoResource>)> GetAutoPayoutStatus(List<int> matchesIds)
    {
        var matchIds = string.Join(',', matchesIds);
        var criteria = new GetAutoStatusCriteria
        {
            MatchIds = matchIds
        };

        var result = await repository.FetchMultipleAsync<MatchStatusModel, FailedAutoResource>(criteria);

        return result;

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
}