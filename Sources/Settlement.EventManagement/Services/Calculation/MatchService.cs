using System.Security.Cryptography;

namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Requests;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models.Calculation;
using System.Text;
using Match = Models.Calculation.Match;

public interface MatchService
{
	Task<List<Match>> GetMatches(FilterCalculationRequest request);

	Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request);

    Task<List<CalculateMatchWaiting>> GetWaitingMatches(string leagueIds, bool isAutoPage);
}

public class MatchServiceImp : MatchService
{
	private static int _isProcessing;

	private readonly IDynamicRepository repository;

	private readonly CachingMatchesService cachingMatchesService;

	private readonly IRefDataService refDataService;

	private readonly MergeDataService mergeDataService;

	private readonly NewInfoMatchService newInfoMatchService;

	private readonly AppSettingsKey appSettingsKey;

	private readonly IMapper mapper;

	public MatchServiceImp(
		IDynamicRepository repository,
		IRefDataService refDataService,
		CachingMatchesService cachingMatchesService,
		MergeDataService mergeDataService,
		NewInfoMatchService newInfoMatchService,
		IOptions<AppSettingsKey> appSettingsKey,
		IMapper mapper)
	{
		this.repository = repository;
		this.refDataService = refDataService;
		this.cachingMatchesService = cachingMatchesService;
		this.mergeDataService = mergeDataService;
		this.newInfoMatchService = newInfoMatchService;
		this.appSettingsKey = appSettingsKey.Value;
		this.mapper = mapper;
	}

	public async Task<List<Match>> GetMatches(FilterCalculationRequest request)
	{
		var criteria = mapper.Map<FilterCalculationRequest, GetMatchesCriteria>(request);
		var matches = await GetMatchesAllSites(criteria);
		var listResultDetail = await ResultDetailByMatchIds(matches);
		var matchesInfoMerged = SetNewMatchInfo(matches, listResultDetail);
		return SortingMatches(matchesInfoMerged, request);
	}

	private List<Match> SetNewMatchInfo(List<Match> matches, List<ResultDetail> listResultDetail)
	{
		foreach (var match in matches)
		{
			var listSourceByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
			var resultDetailByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

			newInfoMatchService.TicketInfo(match);
			match.NewEventStatus = newInfoMatchService.NewEventStatus(match);
			match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
			match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
			match.FastMarketStatus = newInfoMatchService.FastMarketStatus(match);
			match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Halftime);
			match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Final);
			match.IsNotConsistentExHtScore = newInfoMatchService.IsNotConsistentScore(match.SuspenderHalfTime, resultDetailByMatchId, listSourceByMatchId, ResourceType.Halftime);
			match.IsNotConsistentExFtScore = newInfoMatchService.IsNotConsistentScore(match.SuspenderFullTime, resultDetailByMatchId, listSourceByMatchId, ResourceType.Final);
			match.GoalIcon = newInfoMatchService.GoalIcon(match);
			match.RefDataService = refDataService;
		}

		return matches;
	}

	private async Task<List<Match>> GetMatchesAllSites(MultipleSiteCriteria criteria)
	{
		var fetchMatchTasks = appSettingsKey
			.SiteDbServer
			.Select(s => FetchMatches(s, criteria))
			.ToList();
		var listMatch = await Task.WhenAll(fetchMatchTasks.ToArray());

		var matchesInAllServers = listMatch.Select(m => m.ToList()).ToList();

		var baseMatches = matchesInAllServers.SelectMany(m => m).Distinct().ToList();

		for (var i = 1; i < appSettingsKey.SiteDbServer.Count; i++)
		{
			mergeDataService.AddSiteInfo(baseMatches, matchesInAllServers[i]);
		}
		return baseMatches;
	}

	private Task<IEnumerable<Match>> FetchMatches(string server, MultipleSiteCriteria criteria)
	{
		criteria.DbServer = server;
		return repository.FetchAsync<Match>(criteria);
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
        var matches = await cachingMatchesService.GetShortCache(hashLeagueIds, isAutoPage);

		if (matches != null)
		{
			return matches;
		}

		if (0 == Interlocked.Exchange(ref _isProcessing, 1))
		{
			try
			{
                return isAutoPage ? await GetAndCachingAutoCalculationMatches(leagueIds, hashLeagueIds) : await GetAndCachingMatches(leagueIds, hashLeagueIds);
			}
			finally
			{
				Interlocked.Exchange(ref _isProcessing, 0);
			}
		}

        return await cachingMatchesService.GetLongCache(hashLeagueIds, isAutoPage);
		//}
		//catch (Exception ex)
		//{
		//	await Console.Out.WriteLineAsync(ex.Message);
		//	return new List<Match> { };
		//}
	}

    private async Task<List<CalculateMatchWaiting>> GetAndCachingMatches(string leagueIds, string hashLeagueIds)
	{
		var criteria = new GetWaitingCalculationCriteria { LeagueIds = leagueIds };
		var waitingMatches = await GetMatchesAllSites(criteria);
		var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

		var matches = SetNewMatchInfo(waitingMatches, listResultDetail);

        return await cachingMatchesService.SetToCache(matches, hashLeagueIds);
	}

	public async Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request)
	{
		var criteria = mapper.Map<FilterAutoCalculationRequest, GetMatchesAutoCalculateCriteria>(request);
		var matches = await GetMatchesAllSites(criteria);
		var listResultDetail = await ResultDetailByMatchIds(matches);
		await SetReferenceActionsForMatch(matches);

		return SetNewMatchInfo(matches, listResultDetail);
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
		matches.ForEach(m => m.ReferenceActions = referenceActions.ContainsKey(m.MatchId) ? referenceActions[m.MatchId] : new List<Models.Calculation.ReferenceAction>());
	}

    private async Task<List<CalculateMatchWaiting>> GetAndCachingAutoCalculationMatches(string leagueId, string hashLeagueIds)
	{
		var criteria = new GetWaitingAutoCalculationCriteria { LeagueId = int.Parse(leagueId) };
		var waitingMatches = await GetMatchesAllSites(criteria);
		var listResultDetail = await ResultDetailByMatchIds(waitingMatches);
		await SetReferenceActionsForMatch(waitingMatches);

		var matches = SetNewMatchInfo(waitingMatches, listResultDetail);

        return await cachingMatchesService.SetToCache(matches, hashLeagueIds, true);
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