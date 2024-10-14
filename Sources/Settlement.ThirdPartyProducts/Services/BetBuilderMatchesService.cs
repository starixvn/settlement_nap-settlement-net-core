using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderMatchesService
{
    Task<List<SportModel>> Search(FilterRequest request);

    Task<List<MatchDetailModel>> RefreshMatches(MatchesWaitingRequest request);

    Task<List<ResultDetail>> ResultDetailByMatchIds(List<MatchDetailModel> matches);
}

public class BetBuilderMatchesServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    IMapper mapper,
    MergeMatchInfo mergeMatchInfo,
    CachingMatchesService cachingMatchesService,
    BetBuilderService betBuilderService,
    IOptions<AppSettingsKey> appSettingsKey)
    : BetBuilderMatchesService
{
    private static int isProcessing;

    public async Task<List<SportModel>> Search(FilterRequest request)
    {
        var criteria = mapper.Map<FilterRequest, MatchesCriteria>(request);
        var matches = await GetMatches(criteria);
        var resultDetails = await ResultDetailByMatchIds(matches);
        matches = FilterMatch(request, matches);
        matches.ForEach(match =>
        {
            match.RefDataService = refDataService;
            match.MoreScores = betBuilderService.GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
        });

        var leagues = betBuilderService.CreateLeagues(matches);
        var sportsbook = leagues.GroupBy(item => new { item.SportType, item.SportName }).Select(item => new SportModel
        {
            Id = item.Key.SportType,
            Name = item.Key.SportName,
            Leagues = item.OrderBy(league => league.LeagueName).ToList()
        }).ToList();

        return sportsbook;
    }

    public async Task<List<MatchDetailModel>> RefreshMatches(MatchesWaitingRequest request)
    {
        var matches = cachingMatchesService.MatchesOnShortCaching(request.LeagueIds);

        if (matches is { Count: > 0 })
        {
            return matches;
        }

        if (0 == Interlocked.Exchange(ref isProcessing, 1))
        {
            try
            {
                return await GetAndCachingMatches(request);
            }
            finally
            {
                Interlocked.Exchange(ref isProcessing, 0);
            }
        }

        return cachingMatchesService.MatchesOnLongCaching(request.LeagueIds);
    }

    public async Task<List<ResultDetail>> ResultDetailByMatchIds(List<MatchDetailModel> matches)
    {
        var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }

    private async Task AddTicketInfo(List<MatchDetailModel> matches)
    {
        var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
        var criteria = new TicketsInfoCriteria { MatchIds = listMatchId };

        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            var data = (await repository.FetchAsync<Models.SiteMatch>(criteria)).ToList();
            mergeMatchInfo.AddSiteMatch(matches, data);
        }
    }

    private static List<MatchDetailModel> FilterMatch(FilterRequest request, List<MatchDetailModel> matches)
    {
        const int allStatus = 3;
        var listStatus = request.Status.Split(',').ToList();
        if (listStatus.Count is 0 or allStatus || !string.IsNullOrEmpty(request.MatchCode))
        {
            return matches;
        }

        return matches.Where(match => request.Status.IndexOf(match.ParlayStatus, StringComparison.CurrentCulture) > -1).ToList();
    }

    private async Task<List<MatchDetailModel>> GetAndCachingMatches(MatchesWaitingRequest request)
    {
        var criteria = mapper.Map<MatchesWaitingRequest, MatchesWaitingCriteria>(request);
        var matches = await GetMatchesWaiting(criteria);
        var resultDetails = await ResultDetailByMatchIds(matches);

        matches.ForEach(match =>
        {
            match.RefDataService = refDataService;
            match.MoreScores = betBuilderService.GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
        });

        cachingMatchesService.SetToCache(request.LeagueIds, matches);

        return matches;
    }

    private async Task<List<MatchDetailModel>> GetMatchesWaiting(MatchesWaitingCriteria criteria)
    {
        var matches = new List<MatchDetailModel>();
        var isCentralDataBase = true;
        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            var data = (await repository.FetchAsync<MatchDetailModel>(criteria)).ToList();
            if (isCentralDataBase)
            {
                matches = data;
                isCentralDataBase = false;
            }
            else
            {
                matches = mergeMatchInfo.MergeMatches(matches, data);
            }
        }

        SetNewWaitingMatchInfo(matches);
        return matches;
    }

    private async Task<List<MatchDetailModel>> GetMatches(CriteriaBase criteria)
    {
        var matches = (await repository.FetchAsync<MatchDetailModel>(criteria)).ToList();
        await AddTicketInfo(matches);
        SetNewMatchInfo(matches);
        return matches;
    }

    private void SetNewWaitingMatchInfo(List<MatchDetailModel> matches)
    {
        foreach (var match in matches)
        {
            match.ParlayStatus = mergeMatchInfo.ParlayStatus(match, match.TotalTickets, match.TotalTicketsRunning);
            match.QueueStatus = mergeMatchInfo.QueueStatus(match, match.QueueStatus);
        }
    }

    private void SetNewMatchInfo(List<MatchDetailModel> matches)
    {
        foreach (var match in matches)
        {
            match.ParlayStatus = mergeMatchInfo.ParlayStatus(match);
            match.QueueStatus = mergeMatchInfo.QueueStatus(match);
        }
    }
}