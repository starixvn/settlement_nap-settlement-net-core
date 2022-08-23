using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderService
    {
        Task<List<Sport>> GetSports(SportRequest request);

        Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request);

        List<LeagueModel> CreateLeagues(List<MatchDetailModel> matches);

        MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup);

        Task<string> GetResourcesMarket(int matchId);
    }

    public class BetBuilderServiceImp : BetBuilderService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly IMapper mapper;

        private readonly ScoreService scoreService;

        private readonly XmlConvertService xmlConvertService;

        private readonly MergeMatchInfo mergeMatchInfo;

        private readonly AppSettingsKey appSettingsKey;

        public BetBuilderServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IMapper mapper,
            ScoreService scoreService,
            XmlConvertService xmlConvertService,
            MergeMatchInfo mergeMatchInfo,
            IOptions<AppSettingsKey> appSettingsKey)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.scoreService = scoreService;
            this.xmlConvertService = xmlConvertService;
            this.mergeMatchInfo = mergeMatchInfo;
            this.appSettingsKey = appSettingsKey.Value;
        }

        public async Task<List<Sport>> GetSports(SportRequest request)
        {
            var criteria = mapper.Map<SportRequest, SportCriteria>(request);
            var sports = (await repository.FetchAsync<Sport>(criteria)).ToList();
            sports.ForEach(item =>
            {
                item.SportName = refDataService.GetSportName(item.SportType);
            });
            return sports;
        }

        public async Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request)
        {
            var criteria = mapper.Map<LeaguesRequest, LeaguesCriteria>(request);
            var leagues = (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
            foreach (var item in leagues)
            {
                item.SportName = refDataService.GetSportName(item.SportType);
                item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
                item.Group = $"All {item.SportName} Leagues";
            }

            return leagues.OrderBy(item => item.SportType).ThenBy(item => item.LeagueName).ToList();
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

        public async Task<string> GetResourcesMarket(int matchId)
        {
            var criteria = new SelectionTicketDetailCriteria { MatchId = matchId };
            var baseList = new List<ResourceSelectionItemModel>();
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var listMarket = (await repository.FetchAsync<ResourceSelectionItemModel>(criteria)).ToList();
                MergeMarket(baseList, listMarket);
            }

            return baseList.Count > 0 ? xmlConvertService.Serialize(new Models.Resources<ResourceSelectionItemModel> { ResourceItems = baseList })
                : string.Empty;
        }

        private void MergeMarket(List<ResourceSelectionItemModel> baseList, List<ResourceSelectionItemModel> siteList)
        {
            mergeMatchInfo.MergeStatusTicket(baseList, siteList);
            var newItem = siteList.Except(baseList);
            if (newItem.Any())
            {
                baseList.AddRange(newItem);
            }
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
    }
}