namespace Settlement.EventManagement.Services;

using Criteria;
using Models;
using Settlement.Core.Services.SpecificService;
using System.Threading.Tasks;
using Match = Models.Calculation.Match;
using MultiSportMatch = Models.MultiSports.Match;

public interface NewInfoMatchService
{
    string NewEventStatus(BaseMatch match, IEnumerable<ResultDetail> resultDetails = null);

    string EventStatusColor(BaseMatch match);

    string EarlySettlementStatus(BaseMatch match);

    string FastMarketStatus(Match match);

    string ConfirmScore(List<ResultDetail> listResultDetail, string resource);

    bool IsInconsistentScore(string suspenderConfirm, List<ResultDetail> currentResultDetailList, List<ResultDetail> sourceResultDetailList, string resource);

    GoalIcon GoalIcon(Match match);

    void TicketInfo(BaseMatch match);

    bool IsExistsConfirmedEarly(MultiSportMatch match);

    Task<List<MultiSportMatch>> GetAutoSetting(List<MultiSportMatch> matches);
}

public class NewInfoMatchServiceImp : NewInfoMatchService
{
    private readonly SiteMatchService siteMatchService;

    private readonly GoalIconService goalIconService;

    private readonly EventStatusService eventStatusService;

    private readonly BasketballEventStatusService basketballEventStatusService;

    private readonly IDynamicRepository repository;

    public NewInfoMatchServiceImp(
        SiteMatchService siteMatchService,
        GoalIconService goalIconService,
        EventStatusService eventStatusService,
        BasketballEventStatusService basketballEventStatusService,
        IDynamicRepository repository)
    {
        this.siteMatchService = siteMatchService;
        this.goalIconService = goalIconService;
        this.eventStatusService = eventStatusService;
        this.basketballEventStatusService = basketballEventStatusService;
        this.repository = repository;
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

        if (match.Remark.IsPending)
        {
            return siteMatchService.IsExistMarkedTickets(match)
                ? Background.BrightYellowBlinking
                : Background.BrightYellow;
        }

        return siteMatchService.IsExistMarkedTickets(match) ? Background.WhiteBlinking : string.Empty;
    }

    public string NewEventStatus(BaseMatch match, IEnumerable<ResultDetail> resultDetails = null)
    {
        var eventStatus = SportGroup.SupportSettleDetermine.Contains(match.SportType)
            ? basketballEventStatusService.AdjustEventStatusAbandoned(match.EventStatus, resultDetails, match.SportType)
            : match.EventStatus;

        if (match.SportType == SportType.Bandy
            && !string.IsNullOrEmpty(match.BetStatus) && match.BetStatus.Contains("RefundHT;"))
        {
            return BetStatus.RefundHt;
        }

        return eventStatusService.CheckProcessingStatus(eventStatus, match);
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

    public async Task<List<MultiSportMatch>> GetAutoSetting(List<MultiSportMatch> matches)
    {
        var matchStatuses = await getMatchStatus(matches);
        var dictionary = matches.ToDictionary(m => m.MatchId);

        foreach (var matchStatus in matchStatuses)
        {
            dictionary[matchStatus.MatchId].AutoPayoutStatus = matchStatus.StatusId;
        }

        return dictionary.Values.ToList();
    }

    private async Task<IEnumerable<MatchStatusModel>> getMatchStatus(List<MultiSportMatch> matches)
    {
        var matchIds = string.Join(',', matches.Select(m => m.MatchId));
        var criteria = new GetMatchWaitingInfo
        {
            MatchIds = matchIds
        };

        return await repository.FetchAsync<MatchStatusModel>(criteria);
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