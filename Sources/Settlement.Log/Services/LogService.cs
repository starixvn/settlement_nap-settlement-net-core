using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;

namespace Settlement.Log.Services;

public interface LogService
{
    Task<IEnumerable<LogModel>> GetLog(LogRequest request);

    Task<IEnumerable<LogModel>> GetArchiveLog(LogRequest request);

    Task<List<LogModel>> GetLogDetail(List<LogModel> logs, string productType);
}

public class LogServiceImp : LogService
{
    private readonly IDynamicRepository repository;
    private readonly LogDetailService logDetailService;
    private readonly IRefDataService refDataService;
    private readonly IMapper mapper;
    private const string ResettleType = "RES";

    public LogServiceImp(
        IDynamicRepository repository,
        LogDetailService logDetailService,
        IMapper mapper,
        IRefDataService refDataService)
    {
        this.repository = repository;
        this.logDetailService = logDetailService;
        this.mapper = mapper;
        this.refDataService = refDataService;
    }

    public async Task<IEnumerable<LogModel>> GetLog(LogRequest request)
    {
        var criteria = mapper.Map<LogRequest, GetLogCriteria>(request);
        criteria.FromDate = request.ProductType == ResettleType ? null : request.FromDate;
        criteria.ToDate = request.ProductType == ResettleType ? DateTimeOffset.Now.Date : request.ToDate;
        return await repository.FetchAsync<LogModel>(criteria);
    }

    public async Task<IEnumerable<LogModel>> GetArchiveLog(LogRequest request)
    {
        var criteria = mapper.Map<LogRequest, GetArchivedLogCriteria>(request);
        criteria.FromDate = request.ProductType == ResettleType ? null : request.FromDate;
        criteria.ToDate = request.ProductType == ResettleType ? DateTimeOffset.Now.Date : request.ToDate;

        return await repository.FetchAsync<LogModel>(criteria);
    }

    public async Task<List<LogModel>> GetLogDetail(List<LogModel> logs, string productType)
    {
        foreach (var log in logs)
        {
            log.RefDataService = refDataService;
            if (string.Equals(productType, ResettleType))
            {
                log.ResettleLogDetails = await logDetailService.GetLogDetailResettle(log.MatchId, log.SportType);
                log.PlayerNames = await logDetailService.GetPlayerNameCricket(log.MatchId, log.SportType);
            }
            else
            {
                log.MatchLogDetails = await logDetailService.GetLogDetailByMatchAndProduct(log.MatchId, productType);
            }
        }

        return logs;
    }
}