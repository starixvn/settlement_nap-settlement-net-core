using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;

namespace Settlement.Log.Services;

public interface LogService
{
    Task<List<LogModel>> GetLog(LogRequest request);
}

public class LogServiceImp : LogService
{
    private readonly IDynamicRepository repository;
    private readonly IBalanceUpService balanceUpService;
    private readonly LogDetailService logDetailService;
    private readonly IRefDataService refDataService;
    private readonly IMapper mapper;

    public LogServiceImp(
        IDynamicRepository repository,
        IBalanceUpService balanceUpService,
        LogDetailService logDetailService,
        IMapper mapper,
        IRefDataService refDataService)
    {
        this.repository = repository;
        this.balanceUpService = balanceUpService;
        this.logDetailService = logDetailService;
        this.mapper = mapper;
        this.refDataService = refDataService;
    }

    public async Task<List<LogModel>> GetLog(LogRequest request)
    {
        var criteria = mapper.Map<LogRequest, GetSettlementLogCriteria>(request);
        criteria.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;

        var logs =(await repository.FetchAsync<LogModel>(criteria)).ToList();
        return await GetLogDetail(logs, request.ProductType);
    }

    private async Task<List<LogModel>> GetLogDetail(List<LogModel> logs, string productType)
    {
        foreach (var log in logs)
        {
            log.MatchLogDetails = await logDetailService.GetLogDetailByMatchAndProduct(log.MatchId, productType);
            log.RefDataService = refDataService;
        }

        return logs;
    }
}