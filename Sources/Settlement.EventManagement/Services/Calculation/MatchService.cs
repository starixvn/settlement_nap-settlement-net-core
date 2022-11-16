using AutoMapper;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Requests;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface MatchService
    {
        Task<List<Match>> GetMatches(FilterCalculationRequest request);

        Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request);

        Task<List<Match>> GetWaitingMatches(RefreshCalculationRequest request);

        Task<List<Match>> GetWaitingAutoMatches(RefreshAutoCalculationRequest request);
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
            var matches = await MatchesAllSites(request);
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

        private async Task<List<Match>> MatchesAllSites(FilterCalculationRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<FilterCalculationRequest, GetMatchesCriteria>(request);
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Match>(criteria)).ToList();

                if (isCentralDataBase)
                {
                    matches = data;
                    isCentralDataBase = false;
                }
                else
                {
                    matches = mergeDataService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private async Task<List<Match>> WaitingMatchesAllSites(RefreshCalculationRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<RefreshCalculationRequest, GetWaitingCalculationCriteria>(request);
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Match>(criteria)).ToList();

                if (isCentralDataBase)
                {
                    matches = data;
                    isCentralDataBase = false;
                }
                else
                {
                    matches = mergeDataService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
        {
            var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
            var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
            return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
        }

        public async Task<List<Match>> GetWaitingMatches(RefreshCalculationRequest request)
        {
            var matches = await cachingMatchesService.GetShortCache(request.LeagueIds);

            if (matches != null)
            {
                return matches;
            }

            if (0 == Interlocked.Exchange(ref _isProcessing, 1))
            {
                try
                {
                    return await GetAndCachingMatches(request);
                }
                finally
                {
                    Interlocked.Exchange(ref _isProcessing, 0);
                }
            }

            return await cachingMatchesService.GetLongCache(request.LeagueIds);
        }

        public async Task<List<Match>> GetWaitingAutoMatches(RefreshAutoCalculationRequest request)
        {
            var matches = await cachingMatchesService.GetShortCache(request.LeagueId.ToString(), true);

            if (matches != null)
            {
                return matches;
            }

            if (0 == Interlocked.Exchange(ref _isProcessing, 1))
            {
                try
                {
                    return await GetAndCachingAutoCalculationMatches(request);
                }
                finally
                {
                    Interlocked.Exchange(ref _isProcessing, 0);
                }
            }

            return await cachingMatchesService.GetLongCache(request.LeagueId.ToString(), true);
        }

        private async Task<List<Match>> GetAndCachingMatches(RefreshCalculationRequest request)
        {
            var waitingMatches = await WaitingMatchesAllSites(request);
            var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

            var matches = SetNewMatchInfo(waitingMatches, listResultDetail);

            cachingMatchesService.SetToCache(matches, request.LeagueIds);

            return matches;
        }

        public async Task<List<Match>> GetMatchesAutoCalculate(FilterAutoCalculationRequest request)
        {
            var matches = await MatchesAutoCalculateAllSites(request);
            var listResultDetail = await ResultDetailByMatchIds(matches);
            await SetReferenceActionsForMatch(matches);

            return SetNewMatchInfo(matches, listResultDetail);
        }

        private async Task SetReferenceActionsForMatch(List<Match> matches)
        {
            var matchIds = matches.Select(m => m.MatchId);
            var referenceActions = await cachingMatchesService.GetReferenceActions(matchIds);
            matches.ForEach(m => m.ReferenceActions = referenceActions.ContainsKey(m.MatchId) ? referenceActions[m.MatchId] : new List<Models.Calculation.ReferenceAction>());
        }

        private async Task<List<Match>> MatchesAutoCalculateAllSites(FilterAutoCalculationRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<FilterAutoCalculationRequest, GetMatchesAutoCalculateCriteria>(request);
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Match>(criteria)).ToList();

                if (isCentralDataBase)
                {
                    matches = data;
                    isCentralDataBase = false;
                }
                else
                {
                    matches = mergeDataService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private async Task<List<Match>> GetAndCachingAutoCalculationMatches(RefreshAutoCalculationRequest request)
        {
            var waitingMatches = await WaitingAutoCalculationMatchesAllSites(request);
            var listResultDetail = await ResultDetailByMatchIds(waitingMatches);
            await SetReferenceActionsForMatch(waitingMatches);

            var matches = SetNewMatchInfo(waitingMatches, listResultDetail);

            cachingMatchesService.SetToCache(matches, request.LeagueId.ToString());

            return matches;
        }

        private async Task<List<Match>> WaitingAutoCalculationMatchesAllSites(RefreshAutoCalculationRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<RefreshAutoCalculationRequest, GetWaitingAutoCalculationCriteria>(request);
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Match>(criteria)).ToList();

                if (isCentralDataBase)
                {
                    matches = data;
                    isCentralDataBase = false;
                }
                else
                {
                    matches = mergeDataService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private static List<Match> SortingMatches(List<Match> matches, FilterCalculationRequest request)
        {
            if (request.FilterOver > 0)
            {
                return matches.OrderBy(match => match.EventStatus).ThenBy(match => match.MatchCode).ToList();
            }

            return matches.OrderBy(match =>
                    match.EventStatus == EventStatus.Completed && match.IsExistMarkedTicket &&
                    match.IsExistRunningTicket)
                .ThenBy(match => match.EventDate)
                .ThenBy(match => match.KickOffTime)
                .ThenBy(match => match.LeagueId)
                .ThenBy(match => match.MatchId)
                .ThenBy(match => match.BetStatus)
                .ToList();
        }
    }
}