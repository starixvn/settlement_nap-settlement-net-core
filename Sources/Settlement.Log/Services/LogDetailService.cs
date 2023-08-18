using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Log.Contants;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Models.LogElement;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;

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

    private readonly XmlConvertService xmlConvertService;

    private readonly MergeLogService mergeLogService;

    public LogDetailServiceImp(
        IDynamicRepository repository,
        RemarkService remarkService,
        XmlConvertService xmlConvertService,
        MergeLogService mergeLogService)
    {
        this.repository = repository;
        this.remarkService = remarkService;
        resourceNameService = new ResourceNameService(new MapperFactoryBase());
        this.xmlConvertService = xmlConvertService;
        this.mergeLogService = mergeLogService;
    }

    public async Task<List<LogDetailsModels>> GetLogDetailByMatchAndProduct(int matchId, string productType)
    {
        var criteria = new GetLogDetailByMatchAndProductCriteria { MatchId = matchId, ProductType = productType };
        var logDetails = (await repository.FetchAsync<LogDetailsModels>(criteria)).ToList();
        logDetails.ForEach(log => log.Remark = ParseLog(log.Remark));
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
        if (sportType != SportType.Cricket)
        {
            return new List<string>();
        }

        var criteria = new GetPlayerInfoCriteria { MatchId = matchId };
        var listPlayer = (await repository.FetchAsync<PlayerCricketInfo>(criteria)).DistinctBy(item => item.OddsInfo).ToList();
        return listPlayer.Select(item => item.OddsInfo).ToList();
    }

    private string ParseLog(string remark)
    {
        var log = xmlConvertService.Deserialize<LogRoot>($"<logs>{remark}</logs>");
        if (log != null && (log.DistinctLogs != null || log.RootLogs.Any()))
        {
            return $"{string.Join("; ", log.DistinctLogs.Logs.Select(l => $"{l.Name}: {l.Value}"))}; {MergeLog(log.RootLogs)}";
        }

        return remark;
    }

    private string MergeLog(IEnumerable<RootElement> roots)
    {
        var logGroups = roots.SelectMany(r => r.Logs).GroupBy(log => (log.Name, log.Type))
            .ToDictionary(
                group => group.Key,
                group => group.ToList());

        var mergedLogs = logGroups.Where(group => group.Value.Any()).Select(item =>
            {
                return item.Key.Item2 switch
                {
                    LogType.DateMin => mergeLogService.GetMinDate(item.Value),
                    LogType.DateMax => mergeLogService.GetMaxDate(item.Value),
                    LogType.Min => mergeLogService.GetStatistic(item.Value, values => values.Min()),
                    LogType.Max => mergeLogService.GetStatistic(item.Value, values => values.Max()),
                    LogType.Sum => mergeLogService.GetStatistic(item.Value, values => values.Sum()),
                    _ => string.Empty
                };
            })
            .ToList();

        return string.Join("; ", mergedLogs.Where(log => !string.IsNullOrEmpty(log)));
    }
}