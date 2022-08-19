using System;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Requests;
using Match = Settlement.EventManagement.Models.MultiSports.Match;
using System.Threading;
using Fanex.Caching;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.EventManagement.Models.MultiSports;
using Fanex.Settlement.ScaleOut.Request;
using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Services.MultiSports
{
    public interface IMultiSportService
    {
        Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request);

        Task<List<Match>> GetWaitingMatches(RefreshMultiSportRequest request);

        Task<Result> Calculate(CalculateParlayRequest request);
    }

    public class MultiSportServiceImp : IMultiSportService
    {
        private static int _isProcessing;
        private readonly IDynamicRepository repository;
        private readonly IMatchService matchService;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;
        private readonly PermissionService permissionService;
        private readonly IHttpContextAccessor accessor;
        private readonly AppSettingsKey appSettingsKey;

        public MultiSportServiceImp(
            IDynamicRepository repository,
            IMatchService matchService,
            IMapper mapper,
            ICacheService cacheService,
            PermissionService permissionService,
            IHttpContextAccessor accessor,
            IOptions<AppSettingsKey> appSettingsKey)
        {
            this.repository = repository;
            this.matchService = matchService;
            this.permissionService = permissionService;
            this.cacheService = cacheService;
            this.mapper = mapper;
            this.accessor = accessor;
            this.appSettingsKey = appSettingsKey.Value;
        }

        public async Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request)
        {
            var data = await FetchMatchesAndResultDetails(request);
            var matchesByEachSport = GetMoreScore(data);

            var matches = new List<MultiSportMatch>();
            matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
            {
                var multiSportMatch = mapper.Map<Match, MultiSportMatch>(match);
                matches.Add(multiSportMatch);
            }));

            var sportBooks = GroupSport(matches);

            return sportBooks;
        }

        public async Task<List<Match>> GetWaitingMatches(RefreshMultiSportRequest request)
        {
            var matches = MatchesOnShortCaching(request.LeagueIds);

            if (matches != null && matches.Count > 0)
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

            return MatchesOnLongCaching(request.LeagueIds);
        }

        private List<Match> MatchesOnShortCaching(string leagueIds)
        {
            var shortCachingKey = ShortCachingKey(leagueIds);
            return cacheService.Get<List<Match>>(shortCachingKey);
        }

        private List<Match> MatchesOnLongCaching(string leagueIds)
        {
            var longCachingKey = LongCachingKey(leagueIds);
            return cacheService.Get<List<Match>>(longCachingKey);
        }

        private static string ShortCachingKey(string leagueIds) => $"{CacheServiceKey.MemoryCacheMultiSportCacheKey}-{leagueIds}";

        private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-longCaching";

        private async Task<List<Match>> GetAndCachingMatches(RefreshMultiSportRequest request)
        {
            var waitingMatches = await WaitingMatchesAllSites(request);
            var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

            matchService.SetNewMatchInfo(waitingMatches, listResultDetail);

            var matchesByEachSport = GetMoreScore(new MultiSportResult { Matches = waitingMatches, ResultDetails = listResultDetail });
            var matches = new List<Match>();
            matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
            {
                matches.Add(match);
            }));

            SetToCache(request.LeagueIds, matches);

            return matches;
        }

        private async Task<List<Match>> WaitingMatchesAllSites(RefreshMultiSportRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<RefreshMultiSportRequest, GetWaitingMultiSportCriteria>(request);
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
                    matchService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private void SetToCache(string leagueIds, List<Match> matches)
        {
            var shortCachingKey = ShortCachingKey(leagueIds);
            var longCachingKey = LongCachingKey(leagueIds);
            const int shortCacheExpirationTime = 3;
            const int longCacheExpirationTime = 20;
            cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
            cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
        }

        private List<MatchesBySportTypeModel> GetMoreScore(MultiSportResult data)
        {
            var matchesByEachSport = data.Matches.GroupBy(match => match.SportType)
                .Select(sports => new MatchesBySportTypeModel { SportType = sports.Key, Matches = sports.ToList() })
                .ToList();
            var permission = permissionService.GetPermission(CacheServiceKey.MemoryCacheManualPermission);
            foreach (var item in matchesByEachSport)
            {
                item.Matches = matchService.GetScoreForMatchBySportType(item.Matches, data.ResultDetails, item.SportType, permission);
            }

            return matchesByEachSport;
        }

        private List<SportModel> GroupSport(List<MultiSportMatch> matches)
        {
            var sportSorting = new List<int>
            {
                SportType.Tennis,
                SportType.ESports,
                SportType.BasketBall,
                SportType.Badminton,
            };

            var sportBook = matches.GroupBy(match => new { match.SportName, match.SportType })
                                    .OrderByDescending(sport => sportSorting.IndexOf(sport.Key.SportType))
                                    .ThenBy(sport => sport.Key.SportType == SportType.OtherSports)
                                    .ThenBy(sport => sport.Key.SportName)
                                    .Select(sports => new SportModel
                                    {
                                        Id = sports.Key.SportType,
                                        Name = sports.Key.SportName,
                                        Leagues = GroupLeague(sports)
                                    }).ToList();
            return sportBook;
        }

        private static List<LeagueModel> GroupLeague(IEnumerable<MultiSportMatch> matches)
        {
            var currentLeague = 0;
            var leagues = new List<LeagueModel>();
            var league = new LeagueModel();
            foreach (var match in matches)
            {
                if (currentLeague.Equals(match.LeagueId))
                {
                    league.Matches.Add(match);
                }
                else
                {
                    league = new LeagueModel
                    {
                        Name = match.LeagueName,
                        LeagueId = match.LeagueId,
                        AutoCalcSetting = match.AutoCalcSetting,
                        Matches = new List<MultiSportMatch>(),
                        SportType = match.SportType
                    };

                    currentLeague = match.LeagueId;
                    league.Matches.Add(match);
                    leagues.Add(league);
                }
            }

            return leagues.ToList();
        }

        private async Task<MultiSportResult> FetchMatchesAndResultDetails(FilterMultiSportRequest request)
        {
            var matches = await MatchesAllSites(request);
            var resultDetails = await ResultDetailByMatchIds(matches);
            matchService.SetNewMatchInfo(matches, resultDetails);
            return new MultiSportResult
            {
                Matches = matches,
                ResultDetails = resultDetails
            };
        }

        private async Task<List<Match>> MatchesAllSites(FilterMultiSportRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<FilterMultiSportRequest, SportsbookCriteria>(request);
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
                    matchService.MergeMatches(matches, data);
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

        public async Task<Result> Calculate(CalculateParlayRequest request)
        {
            var validateResult = await ValidateCalculateParlay(request);
            
            if (!string.IsNullOrEmpty(validateResult.MatchIdsValid))
            {
                await UpdateResultParlay(validateResult, request);
                ExecuteCalculateParlay(validateResult, request);
            }

            return new Result
            {
                ErrCode = validateResult.ErrCode,
                ErrMsg = validateResult.ErrMsg
            };
        }

        private async Task UpdateResultParlay(ValidateParlayResult validateResult, CalculateParlayRequest request)
        {
            var listMatchIds = validateResult.MatchIdsValid.Split(',');
            var updateResultRequest = new UpdateMatchInfoRequest
            {
                Action = ActionType.CalculateAll,
                AdminId = request.AdminId,
                Mode = "MP",
            };

            foreach (var matchId in listMatchIds)
            {
                updateResultRequest.MatchId = Convert.ToInt32(matchId);
                await matchService.UpdateMatchInfo(updateResultRequest);
            }
        }

        private void ExecuteCalculateParlay(ValidateParlayResult validateResult, CalculateParlayRequest request)
        {
            var criteria = new ParlayCriteria
            {
                MatchIds = validateResult.MatchIdsValid,
                Action = ActionType.CalculateAll,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                AdminId = request.AdminId
            };

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
        }

        private async Task<ValidateParlayResult> ValidateCalculateParlay(CalculateParlayRequest request)
        {
            var validateEventResult = await ValidateParlayEvent(request);
            var errorMessage = "All matches are being calculated, except following matches ";
            const string postErrorMessage = " Please contact Starix IT for further support!";
            if (string.IsNullOrEmpty(validateEventResult.MatchIdsValid))
            {
                errorMessage += validateEventResult.ErrMsg;
                errorMessage += postErrorMessage;
                return new ValidateParlayResult
                {
                    ErrCode = validateEventResult.ErrCode,
                    ErrMsg = errorMessage,
                };
            }

            var showError = false;
            var validateTicketResult = await ValidateParlayTicket(validateEventResult);

            if (!string.IsNullOrEmpty(validateEventResult.ErrMsg))
            {
                showError = true;
                errorMessage += validateEventResult.ErrMsg;
            }

            if (!string.IsNullOrEmpty(validateTicketResult.ErrMsg))
            {
                showError = true;
                errorMessage += validateTicketResult.ErrMsg;
            }

            var errorCode = validateEventResult.ErrCode > 0 ? validateEventResult.ErrCode : validateTicketResult.ErrCode;
            return showError ? new ValidateParlayResult
            {
                ErrCode = errorCode,
                ErrMsg = errorMessage,
                MatchIdsValid = validateTicketResult.MatchIdsValid
            } : new ValidateParlayResult
            {
                MatchIdsValid = validateTicketResult.MatchIdsValid
            };
        }

        private async Task<ValidateParlayResult> ValidateParlayEvent(CalculateParlayRequest request)
        {
            var validateEventCriteria = new ValidateCalculateParlayCriteria
            {
                MatchIds = request.MatchIds,
                Action = ActionType.CalculateAll
            };

            await repository.ExecuteAsync(validateEventCriteria);

            return new ValidateParlayResult
            {
                ErrCode = validateEventCriteria.ErrCode,
                ErrMsg = validateEventCriteria.ErrMsg,
                MatchIdsValid = validateEventCriteria.MatchIdsValid
            };
        }

        private async Task<ValidateParlayResult> ValidateParlayTicket(ValidateParlayResult validateEventResult)
        {
            var validateTicketCriteria = new ValidateTicketParlayCriteria
            {
                MatchIdsValid = validateEventResult.MatchIdsValid,
                Action = ActionType.CalculateAll
            };

            var errorMessage = "";
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                if (!string.IsNullOrEmpty(validateTicketCriteria.MatchIdsValid))
                {
                    validateTicketCriteria.MatchIds = validateTicketCriteria.MatchIdsValid;
                    validateTicketCriteria.DbServer = server;
                    validateTicketCriteria.MatchIdsValid = null;
                    await repository.ExecuteAsync(validateTicketCriteria);
                    if (!string.IsNullOrEmpty(validateTicketCriteria.ErrMsg))
                    {
                        errorMessage += validateTicketCriteria.ErrMsg;
                    }
                }
            }

            return new ValidateParlayResult
            {
                ErrCode = validateTicketCriteria.ErrCode,
                ErrMsg = errorMessage,
                MatchIdsValid = validateTicketCriteria.MatchIdsValid
            };
        }
    }
}