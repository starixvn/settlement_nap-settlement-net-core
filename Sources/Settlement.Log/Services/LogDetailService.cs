using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
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

public class LogDetailServiceImp(
    IDynamicRepository repository,
    RemarkService remarkService,
    XmlConvertService xmlConvertService,
    MergeLogService mergeLogService)
    : LogDetailService
{
    private readonly IResourceNameService resourceNameService = new ResourceNameService(new MapperFactoryBase());

    public async Task<List<LogDetailsModels>> GetLogDetailByMatchAndProduct(int matchId, string productType)
    {
        var criteria = new GetLogDetailByMatchAndProductCriteria { MatchId = matchId, ProductType = productType };
        var logDetails = (await repository.FetchAsync<LogDetailsModels>(criteria)).ToList();
        logDetails.ForEach(log => log.Remark = ParseLog(log.Remark, log.ActionId));
        return logDetails;
    }

    public async Task<List<ResettleLogDetail>> GetLogDetailResettle(int matchId, int sportType)
    {
        var criteria = new GetLogResettleCriteria { MatchId = matchId, SportType = sportType };
        var listLog = (await repository.FetchAsync<ResettleLogDetail>(criteria)).ToList();
        var key = KeyConstants.KeyDictionary.TryGetValue(sportType, out var value)
            ? value
            : KeyConstants.KeyDictionary[0];

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
            return [];
        }

        var criteria = new GetPlayerInfoCriteria { MatchId = matchId };
        var listPlayer = (await repository.FetchAsync<PlayerCricketInfo>(criteria)).DistinctBy(item => item.OddsInfo)
            .ToList();
        return listPlayer.Select(item => item.OddsInfo).ToList();
    }

    private string ParseLog(string remark, int actionId)
    {
        try
        {
            var log = xmlConvertService.Deserialize<LogRoot>($"<logs>{remark}</logs>");

            if (ShouldProcessLogs(log))
            {
                var distinctLogs = mergeLogService.DistinctLogsString(log.DistinctLogs);
                var rootLogs = mergeLogService.MergeLog(log.RootLogs);
                var fastMarketLogs = GetFastMarketLogsString(actionId, remark, log);

                var nonEmptyRemarks = new List<string>
                {
                    distinctLogs,
                    rootLogs,
                    fastMarketLogs
                }.Where(r => !string.IsNullOrEmpty(r));

                return string.Join("; ", nonEmptyRemarks);
            }

            return GetFastMarketLogsString(actionId, remark, null, false);
        }
        catch
        {
            return GetFastMarketLogsString(actionId, remark, null, false);
        }
    }

    private static bool ShouldProcessLogs(LogRoot log)
    {
        return log.BetTypeRoot.Any() || log.EventCounterRoot.Any() || log.DistinctLogs.Any() || log.RootLogs.Any();
    }

    private string GetFastMarketLogsString(int actionId, string remark, LogRoot log, bool newLogStyle = true)
    {
        if (!remarkService.IsFastMarketAction(actionId))
        {
            return newLogStyle ? string.Empty : remark;
        }

        if (!newLogStyle)
        {
            return remarkService.RemarkValue(remark);
        }

        var betTypes = (log.BetTypeRoot.FirstOrDefault() ?? new BetTypesRoot()).BetTypes;
        var eventCounters = (log.EventCounterRoot.FirstOrDefault() ?? new EventCountersRoot()).Items;
        return remarkService.RemarkValue(betTypes, eventCounters);
    }
}