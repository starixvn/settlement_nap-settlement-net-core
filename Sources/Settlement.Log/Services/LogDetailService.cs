using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;
using Settlement.ResourceName.Services;

namespace Settlement.Log.Services;

public interface LogDetailService
{
    Task<List<LogDetailsModels>> GetLogDetailByMatchAndProduct(int matchId, string productType);

    Task<List<ResettleLogDetail>> GetLogDetailResettle(int matchId, int sportType);

    Task<List<string>> GetPlayerNameCricket(int matchId, int sportType);
}

public class LogDetailServiceImp : LogDetailService
{
    private readonly IDynamicRepository repository;

    private readonly RemarkService remarkService;

    private readonly IResourceNameService resourceNameService;

    public LogDetailServiceImp(
        IDynamicRepository repository,
        RemarkService remarkService)
    {
        this.repository = repository;
        this.remarkService = remarkService;
        resourceNameService = new ResourceNameService(new MapperFactoryBase());
    }

    public async Task<List<LogDetailsModels>> GetLogDetailByMatchAndProduct(int matchId, string productType)
    {
        var criteria = new GetLogDetailByMatchAndProductCriteria { MatchId = matchId, ProductType = productType };
        var logDetails = (await repository.FetchAsync<LogDetailsModels>(criteria)).ToList();

        foreach (var log in logDetails.Where(log => remarkService.IsFastMarketAction(log.ActionId)))
        {
            log.Remark = remarkService.RemarkValue(log.Remark);
        }

        return logDetails;
    }

    public async Task<List<ResettleLogDetail>> GetLogDetailResettle(int matchId, int sportType)
    {
        var criteria = new GetLogResettleCriteria { MatchId = matchId, SportType = sportType };
        var listLog = (await repository.FetchAsync<ResettleLogDetail>(criteria)).ToList();
        var key = KeyConstants.KeyDictionary.TryGetValue(sportType, out var value) ? value : KeyConstants.KeyDictionary[0];

        listLog.ForEach(log =>
        {
            (log.BetType, log.ResourceName) = resourceNameService.GetResourceName(log.ResourceId, key, sportType);
        });

        return listLog;
    }

    public async Task<List<string>> GetPlayerNameCricket(int matchId, int sportType)
    {
        if (sportType != SportType.Cricket) return new List<string>();

        var criteria = new GetPlayerInfoCriteria { MatchId = matchId };
        var listPlayer = (await repository.FetchAsync<PlayerCricketInfo>(criteria)).DistinctBy(item => item.OddsInfo).ToList();
        return listPlayer.Select(item => item.OddsInfo).ToList();
    }
}