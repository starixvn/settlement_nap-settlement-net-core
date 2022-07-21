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
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Match = Settlement.EventManagement.Models.Match;
using System.Threading;
using Fanex.Caching;
using Microsoft.AspNetCore.Http;

namespace Settlement.EventManagement.Services
{
    public interface IMultiSportService
    {
        Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request);

        Task<List<Match>> GetWaitingMatches(RefreshMatchesRequest request);

        Task<List<Sport>> GetSports(SportRequest request);

        Task<List<LeagueTypeModel>> GetLeagues(LeagueRequest request);

        Task<Result> Calculate(CalculateParlayRequest request);
    }

    public class MultiSportServiceImp : IMultiSportService
    {
        private static int _isProcessing;
        private readonly IDynamicRepository repository;
        private readonly IRefDataService refDataService;
        private readonly IMatchService matchService;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;
        private readonly PermissionService permissionService;
        private static readonly List<int> PopularSport = new List<int> { SportType.Badminton, SportType.BasketBall, SportType.ESports, SportType.Tennis };
        private const string PopularGroup = "All Popular Sports";
        private const string OtherGroup = "All Other Sports";
        private readonly IHttpContextAccessor accessor;

        public MultiSportServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IMatchService matchService,
            IMapper mapper,
            ICacheService cacheService,
            PermissionService permissionService,
            IHttpContextAccessor accessor)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.matchService = matchService;
            this.permissionService = permissionService;
            this.cacheService = cacheService;
            this.mapper = mapper;
            this.accessor = accessor;
        }

        public async Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request)
        {
            var criteria = mapper.Map<FilterMultiSportRequest, SportsbookCriteria>(request);
            var data = await FetchMatchesAndResultDetails(criteria);
            var matchesByEachSport = GetMoreScore(data);

            var matches = new List<MultiSportMatch>();
            matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                var multiSportMatch = mapper.Map<Match, MultiSportMatch>(match);
                matches.Add(multiSportMatch);
            }));

            var sportBooks = GroupSport(matches);

            return sportBooks;
        }

        public async Task<List<Sport>> GetSports(SportRequest request)
        {
            var criteria = mapper.Map<SportRequest, SportCriteria>(request);
            var sports = (await repository.FetchAsync<Sport>(criteria)).ToList();
            sports.ForEach(x => x.SportName = refDataService.GetSportName(x.SportType));

            return OrderSport(sports.OrderBy(item => item.SportName).ToList());
        }

        public async Task<List<LeagueTypeModel>> GetLeagues(LeagueRequest request)
        {
            var criteria = mapper.Map<LeagueRequest, LeagueCriteria>(request);
            var leagues = (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
            foreach (var item in leagues)
            {
                item.SportName = refDataService.GetSportName(item.SportType);
                item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
                item.Group = $"All {item.SportName} Leagues";
            }

            return SortLeague(leagues.ToList());
        }

        public async Task<List<Match>> GetWaitingMatches(RefreshMatchesRequest request)
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

        private async Task<List<Match>> GetAndCachingMatches(RefreshMatchesRequest request)
        {
            var criteria = mapper.Map<RefreshMatchesRequest, GetWaitingMatchesMultiSportCriteria>(request);
            var data = await FetchMatchesAndResultDetails(criteria);
            var matchesByEachSport = GetMoreScore(data);
            var matches = new List<Match>();
            matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
            {
                matches.Add(match);
            }));

            SetToCache(request.LeagueIds, matches);

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

        private static List<Sport> OrderSport(List<Sport> sports)
        {
            var list = new List<Sport>();
            var otherGroup = new List<Sport>();
            var otherSport = new List<Sport>();

            sports.ForEach(item =>
            {
                if (PopularSport.IndexOf(item.SportType) > -1)
                {
                    item.Group = PopularGroup;
                    list.Add(item);
                }
                else
                {
                    item.Group = OtherGroup;
                    if (item.SportType == SportType.OtherSports)
                    {
                        otherSport.Add(item);
                    }
                    else
                    {
                        otherGroup.Add(item);
                    }
                }
            });

            list.AddRange(otherGroup);
            list.AddRange(otherSport);

            return list;
        }

        private static List<LeagueTypeModel> SortLeague(List<LeagueTypeModel> leagues)
        {
            var popularGroup = new List<LeagueTypeModel>();
            var otherGroup = new List<LeagueTypeModel>();
            var otherSport = new List<LeagueTypeModel>();
            leagues.ForEach(item =>
            {
                if (PopularSport.IndexOf(item.SportType) > -1)
                {
                    popularGroup.Add(item);
                }
                else
                {
                    if (item.SportType == SportType.OtherSports)
                    {
                        otherSport.Add(item);
                    }
                    else
                    {
                        otherGroup.Add(item);
                    }
                }
            });

            var list = popularGroup.OrderBy(item => item.SportName).ThenBy(item => item.LeagueName).ToList();
            list.AddRange(otherGroup.OrderBy(item => item.SportName).ThenBy(item => item.LeagueName).ToList());
            list.AddRange(otherSport.OrderBy(item => item.LeagueName).ToList());

            return list;
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

        private static List<LeagueModel> GroupLeague(IEnumerable<MultiSportMatch> sports)
        {
            var currentLeague = 0;
            var leagues = new List<LeagueModel>();
            var league = new LeagueModel();
            foreach (var sport in sports)
            {
                if (!currentLeague.Equals(sport.LeagueId))
                {
                    league = new LeagueModel
                    {
                        Name = sport.LeagueName,
                        LeagueId = sport.LeagueId,
                        Matches = new List<MultiSportMatch>(),
                        SportType = sport.SportType
                    };

                    currentLeague = sport.LeagueId;
                    league.Matches.Add(sport);
                    leagues.Add(league);
                }
                else
                {
                    league.Matches.Add(sport);
                }
            }

            return leagues.ToList();
        }

        private async Task<MultiSportResult> FetchMatchesAndResultDetails(ICriteria criteria)
        {
            var data = await repository.FetchMultipleAsync<Match, ResultDetail>(criteria);
            return new MultiSportResult
            {
                Matches = data.Item1.ToList(),
                ResultDetails = data.Item2.ToList()
            };
        }

        public async Task<Result> Calculate(CalculateParlayRequest request)
        {
            var criteria = mapper.Map<CalculateParlayRequest, ParlayCriteria>(request);
            criteria.Action = ActionType.CalculateAll;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}