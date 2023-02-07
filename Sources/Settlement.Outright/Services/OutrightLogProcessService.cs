using Settlement.Core.Services;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface OutrightLogProcessService
{
    Task<List<OutrightLog>> GetOutrightLogByMatchCode(GetLogRequest request);

    Task<List<OutrightLog>> GetOutrightLogByOutrightId(GetLogRequest request);
}

public class OutrightLogProcessServiceImp : OutrightLogProcessService
{
    private readonly OutrightLogQueryService outrightLogQueryService;

    private readonly IRefDataService refDataService;

    public OutrightLogProcessServiceImp(OutrightLogQueryService outrightLogQueryService,
        IRefDataService refDataService)
    {
        this.outrightLogQueryService = outrightLogQueryService;
        this.refDataService = refDataService;
    }

    public async Task<List<OutrightLog>> GetOutrightLogByMatchCode(GetLogRequest request)
    {
        var calculationLogs = await outrightLogQueryService.GetOutrightLogs(request);
        var eventLogList = new List<OutrightLog>();

        foreach (var item in calculationLogs)
        {
            request.MatchId = item.OrId;
            eventLogList.AddRange(await GetOutrightLogByOutrightId(request));
        }

        return eventLogList
              .GroupBy(m => m.LeagueId)
              .Select(x => new OutrightLog
              {
                  LeagueId = x.Key,
                  RefDataService = refDataService,
                  OutrightLogDetails = x.SelectMany(y => y.OutrightLogDetails).OrderBy(s => s.LogDate).ToList()
              })
              .ToList();
    }

    public virtual async Task<List<OutrightLog>> GetOutrightLogByOutrightId(GetLogRequest request)
    {
        var eventLogList = new List<OutrightLog>();
        var outrightLog = await outrightLogQueryService.GetOutrightLog(request);
        outrightLog.RefDataService = refDataService;
        var getOutrightLogDetailCriteria = new GetOutrightLogDetailCriteria
        {
            MatchId = outrightLog.OrId,
            LeagueId = outrightLog.LeagueId,
            ToDate = request.ToDate,
            FromDate = request.FromDate
        };

        var logDetails = (await outrightLogQueryService.GetOutrightLogDetails(getOutrightLogDetailCriteria)).ToList();
        if (logDetails.Any())
        {
            logDetails.ForEach(x =>
            {
                x.TeamId = outrightLog.TeamId;
                x.RefDataService = refDataService;
            });

            outrightLog.OutrightLogDetails = logDetails;
            eventLogList.Add(outrightLog);
        }

        return eventLogList;
    }
}