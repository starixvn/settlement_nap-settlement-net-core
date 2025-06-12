namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Requests;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models.Calculation;
using System.Security.Cryptography;
using System.Text;
using Match = Models.Calculation.Match;

public interface MatchService
{
    Task<List<Match>> GetMatches(FilterCalculationRequest request);

    Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request);

    Task<List<CalculateMatchWaiting>> GetWaitingMatches(string leagueIds, bool isAutoPage);
}

public class MatchServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    CachingMatchesService cachingMatchesService,
    MergeDataService mergeDataService,
    NewInfoMatchService newInfoMatchService,
    IOptions<AppSettingsKey> appSettingsKey,
    IMapper mapper)
    : MatchService
{
    private static int _isProcessing;

    public async Task<List<Match>> GetMatches(FilterCalculationRequest request)
    {
        var criteria = mapper.Map<FilterCalculationRequest, GetMatchesCriteria>(request);
        var matches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(matches);
        var matchesInfoMerged = await SetNewMatchInfo(matches, listResultDetail);
        return SortingMatches(matchesInfoMerged, request);
    }

    private async Task<List<Match>> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail, bool isAutoPage = false)
    {
        SetNewEventStatus(matches, listResultDetail);
        if (isAutoPage)
        {
            return matches;
        }

        await SetAutoPayoutStatus(matches);


        return matches;
    }

    private async Task SetAutoPayoutStatus(List<Match> matches)
    {
        var matchIds = matches.Select(m => m.MatchId).ToList();
        var (autoPayoutStatus, _) = await newInfoMatchService.GetAutoPayoutStatus(matchIds);
        matches.ForEach(match =>
        {
            var matchStatus = autoPayoutStatus.FirstOrDefault(m => m.MatchId == match.MatchId);
            if (matchStatus != null)
            {
                match.AutoPayoutStatus = matchStatus.AutoPayoutStatus;
                match.AutoInstantStatus = matchStatus.InstantStatus;
            }
        });
    }

    private void SetNewEventStatus(List<Match> matches, List<ResultDetail> listResultDetail)
    {
        foreach (var match in matches)
        {
            var sourceResultDetail = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
            var currentResultDetail = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

            newInfoMatchService.TicketInfo(match);
            match.NewEventStatus = newInfoMatchService.NewEventStatus(match);
            match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
            match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
            match.FastMarketStatus = newInfoMatchService.FastMarketStatus(match);
            match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(sourceResultDetail, ResourceType.Halftime);
            match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(sourceResultDetail, ResourceType.Final);
            match.IsNotConsistentExHtScore = newInfoMatchService.IsInconsistentScore(match.SuspenderHalfTime, currentResultDetail, sourceResultDetail, ResourceType.Halftime);
            match.IsNotConsistentExFtScore = newInfoMatchService.IsInconsistentScore(match.SuspenderFullTime, currentResultDetail, sourceResultDetail, ResourceType.Final);
            match.GoalIcon = newInfoMatchService.GoalIcon(match);
            match.RefDataService = refDataService;
            match.IsTraderConfirmFt = currentResultDetail.Exists(r => r.ResourceId == ResourceType.Final && r.ResultStatusId == ResultStatus.Confirmed);
            match.IsTraderConfirmHt = currentResultDetail.Exists(r => r.ResourceId == ResourceType.Halftime && r.ResultStatusId == ResultStatus.Confirmed);
            match.MoreScores = GetMoreScores(currentResultDetail);
        }
    }


    private MoreScores GetMoreScores(List<ResultDetail> resultDetails)
    {
        var htResultDetail = resultDetails.Find(r => r.ResourceId == ResourceType.Halftime);
        var htScore = FromResultDetail(htResultDetail);

        var ftResultDetail = resultDetails.Find(r => r.ResourceId == ResourceType.Final);
        var ftScore = FromResultDetail(ftResultDetail);

        return new MoreScores
        {
            HalfTimeScore = htScore,
            FinalScore = ftScore,
        };
    }

    private Score FromResultDetail(ResultDetail resultDetail)
    {
        var score = new Score(home: resultDetail?.HomeValue, away: resultDetail?.AwayValue)
        {
            IsConfirmed = resultDetail?.ResultStatusId == ResultStatus.Confirmed,
            IsNotSettled = resultDetail?.ResultStatusId != ResultStatus.AutoSettled && resultDetail?.ResultStatusId != ResultStatus.ManuallySettled,
        };

        return score;
    }

    private async Task<List<Match>> GetMatchesAllSites(MultipleSiteCriteria criteria)
    {
        var siteDbServer = appSettingsKey.Value.SiteDbServer;
        var fetchMatchTasks = siteDbServer.Select(s => FetchMatches(s, criteria)).ToList();
        var listMatch = await Task.WhenAll(fetchMatchTasks.ToArray());

        var matchesInAllServers = listMatch.Select(m => m.ToList()).ToList();

        var baseMatches = matchesInAllServers.SelectMany(m => m).Distinct().ToList();

        for (var i = 1; i < siteDbServer.Count; i++)
        {
            mergeDataService.AddSiteInfo(baseMatches, matchesInAllServers[i]);
        }
        return baseMatches;
    }

    private async Task<IEnumerable<Match>> FetchMatches(string server, MultipleSiteCriteria criteria)
    {
        criteria.DbServer = server;
        return await repository.FetchAsync<Match>(criteria);
    }

    private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
    {
        var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }

    public async Task<List<CalculateMatchWaiting>> GetWaitingMatches(string leagueIds, bool isAutoPage)
    {
        var hashLeagueIds = ConvertKeyToHash(leagueIds);
        var matches = cachingMatchesService.GetShortCache(hashLeagueIds, isAutoPage);

        if (matches != null)
        {
            return matches;
        }

        if (0 == Interlocked.Exchange(ref _isProcessing, 1))
        {
            try
            {
                return isAutoPage
                    ? await GetAndCachingAutoCalculationMatches(leagueIds, hashLeagueIds)
                    : await GetAndCachingMatches(leagueIds, hashLeagueIds);
            }
            finally
            {
                Interlocked.Exchange(ref _isProcessing, 0);
            }
        }

        return cachingMatchesService.GetLongCache(hashLeagueIds, isAutoPage);
    }

    private async Task<List<CalculateMatchWaiting>> GetAndCachingMatches(string leagueIds, string hashLeagueIds)
    {
        var criteria = new GetWaitingCalculationCriteria { LeagueIds = leagueIds };
        var waitingMatches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

        var matches = await SetNewMatchInfo(waitingMatches, listResultDetail);

        return cachingMatchesService.SetToCache(matches, hashLeagueIds);
    }

    public async Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request)
    {
        var criteria = mapper.Map<FilterAutoCalculationRequest, GetMatchesAutoCalculateCriteria>(request);
        var matches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(matches);
        await SetReferenceActionsForMatch(matches);

        return await SetNewMatchInfo(matches, listResultDetail, true);
    }

    private static string ConvertKeyToHash(string input)
    {
        var data = SHA1.HashData(Encoding.Unicode.GetBytes(input));
        return Convert.ToHexString(data).ToLowerInvariant();
    }

    private async Task SetReferenceActionsForMatch(List<Match> matches)
    {
        var matchIds = matches.Select(m => m.MatchId);
        var referenceActions = await cachingMatchesService.GetReferenceActions(matchIds);
        matches.ForEach(m => m.ReferenceActions = referenceActions.TryGetValue(m.MatchId, out var action) ? action : []);
    }

    private async Task<List<CalculateMatchWaiting>> GetAndCachingAutoCalculationMatches(string leagueId, string hashLeagueIds)
    {
        var criteria = new GetWaitingAutoCalculationCriteria { LeagueId = int.Parse(leagueId) };
        var waitingMatches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(waitingMatches);
        await SetReferenceActionsForMatch(waitingMatches);

        var matches = await SetNewMatchInfo(waitingMatches, listResultDetail, true);

        return cachingMatchesService.SetToCache(matches, hashLeagueIds, true);
    }

    private static List<Match> SortingMatches(List<Match> matches, FilterCalculationRequest request)
    {
        if (request.FilterOver > 0)
        {
            return matches.OrderBy(match => match.OriginalEventStatus.ToLowerInvariant())
                .ThenBy(match => match.MatchCode.ToLowerInvariant()).ToList();
        }

        return matches.OrderBy(match => !(match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && match.IsExistRunningTicket))
                .ThenBy(match => match.OriginalEventStatus.ToLowerInvariant() == EventStatus.Completed && !match.IsExistRunningTicket)
                .ThenBy(match => match.KickOffTime)
                .ThenBy(match => match.LeagueId)
                .ThenBy(match => match.SettlementStatus != 0)
                .ThenBy(match => match.MatchCode.ToLowerInvariant())
                .ToList();
    }
}