using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderService
{
    Task<List<Sport>> GetSports(SportRequest request);

    Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request);

    List<LeagueModel> CreateLeagues(List<MatchDetailModel> matches);

    MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup);

    Task<string> GetResourcesMarket(int matchId);
}

public class BetBuilderServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    IMapper mapper,
    ScoreService scoreService,
    XmlConvertService xmlConvertService,
    MergeMatchInfo mergeMatchInfo,
    IOptions<AppSettingsKey> appSettingsKey)
    : BetBuilderService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

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
        var matchesByLeagueIds = matches.GroupBy(m => m.LeagueId).ToDictionary(m => m.Key, m => m.ToList());
        var leagues = matchesByLeagueIds.Select(l => LeagueItem(l.Key, l.Value)).ToList();
        return leagues.OrderBy(item => item.SportType).ToList();
    }

    public MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup)
    {
        var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == matchId).ToList();
        return new MoreScores
        {
            HalfTimeScore = scoreService.HalftimeScore(resultDetailByMatchId, sportType),
            FinalScore = scoreService.FinalScore(resultDetailByMatchId, sportType),
            Sets = scoreService.ScoreOfSets(resultDetailByMatchId, sportType, isPopup)
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
        baseList.AddRange(newItem);
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