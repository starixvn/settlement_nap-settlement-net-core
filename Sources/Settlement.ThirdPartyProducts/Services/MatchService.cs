using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface MatchService
    {
        Task<MatchDetailModel> GetMatch(MatchInfoRequest request);

        Task<List<ResultDetail>> ResultDetailByMatchIds(List<MatchDetailModel> matches);

        Task<List<MatchDetailModel>> AddTicketInfo(List<MatchDetailModel> matches);

        MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup);

        List<LeagueModel> CreateLeagues(List<MatchDetailModel> matches);
    }

    public class MatchServiceImp : MatchService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly ScoreService scoreService;

        private readonly IMapper mapper;

        private readonly AppSettingsKey appSettingsKey;

        public MatchServiceImp(
            IRefDataService refDataService,
            ScoreService scoreService,
            IMapper mapper,
            IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey)
        {
            this.refDataService = refDataService;
            this.scoreService = scoreService;
            this.mapper = mapper;
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
        }

        public async Task<List<ResultDetail>> ResultDetailByMatchIds(List<MatchDetailModel> matches)
        {
            var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
            var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
            return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
        }

        public async Task<List<MatchDetailModel>> AddTicketInfo(List<MatchDetailModel> matches)
        {
            var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
            var criteria = new TicketsInfoCriteria { MatchIds = listMatchId };

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Models.SiteMatch>(criteria)).ToList();
                AddSiteMatch(matches, data);
            }
            return matches;
        }

        public async Task<MatchDetailModel> GetMatch(MatchInfoRequest request)
        {
            var criteria = mapper.Map<MatchInfoRequest, MatchInfoCriteria>(request);
            var data = await repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(criteria);

            var matchDetail = data.Item1.FirstOrDefault();
            var resultDetails = data.Item2.ToList();
            matchDetail.MoreScores = GetScoreByMatchId(resultDetails, matchDetail.MatchId, matchDetail.SportType, true);
            matchDetail.RefDataService = refDataService;
            return matchDetail;
        }

        public List<LeagueModel> CreateLeagues(List<MatchDetailModel> matches)
        {
            var leagueIds = matches.GroupBy(m => m.LeagueId).Select(m => m.Key).ToList();
            var leagues = new List<LeagueModel>();
            foreach (var leagueId in leagueIds)
            {
                var matchesByLeagueId = matches.Where(m => m.LeagueId == leagueId).ToList();
                var league = LeagueItem(leagueId, matchesByLeagueId);
                leagues.Add(league);
            }

            return leagues.OrderBy(item => item.SportType).ToList();
        }

        private LeagueModel LeagueItem(int leagueId, List<MatchDetailModel> matches)
        {
            var isAutoSettingForLeague = matches[0].AutoCalcSetting.IsAutoSettingForLeague;
            var sportType = matches[0].SportType;
            return new LeagueModel
            {
                SportType = sportType,
                LeagueId = leagueId,
                IsAutoSettingForLeague = isAutoSettingForLeague,
                Matches = SortMatch(matches),
                RefDataService = refDataService
            };
        }

        private static List<MatchDetailModel> SortMatch(IEnumerable<MatchDetailModel> matches)
        {
            var eventStatuses = new List<string>
            {
                "Running",
                "Result Pending",
                "Postponed",
                "Internal",
                "Closed",
                "Completed",
                "Refund HT",
                "Refund FT",
                "Refund"
            };
            return matches.OrderBy(match => eventStatuses.IndexOf(match.EventStatus))
                          .ThenBy(match => match.KickOffTime)
                          .ThenBy(match => match.MatchId)
                          .ToList();
        }

        private void AddSiteMatch(List<MatchDetailModel> matches, List<Models.SiteMatch> siteMatches)
        {
            matches.ForEach(item =>
            {
                var siteMatch = siteMatches.FirstOrDefault(match => match.MatchId == item.MatchId);
                if (siteMatch != null && (item.SiteMatch.Count == 0 || IsChangedOnTicket(item.SiteMatch.First(), siteMatch)))
                {
                    item.SiteMatch.Add(siteMatch);
                }
            });
        }

        private bool IsChangedOnTicket(Models.SiteMatch match, Models.SiteMatch siteMatch)
        {
            return match.TotalTickets != siteMatch.TotalTickets
                || match.TotalTicketsRunning != siteMatch.TotalTicketsRunning
                || match.QueueStatus != siteMatch.QueueStatus;
        }

        public MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup)
        {
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == matchId).ToList();
            return new MoreScores
            {
                HalfTimeScore = scoreService.HalftimeScore(resultDetailByMatchId, sportType),
                FinalScore = scoreService.FinalScore(resultDetailByMatchId, sportType),
                Sets = scoreService.ScoreOfSets(resultDetailByMatchId, sportType, isPopup),
            };
        }
    }
}