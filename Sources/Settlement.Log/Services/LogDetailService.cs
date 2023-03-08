using Fanex.Data.Repository;
using Settlement.Log.Criteria;
using Settlement.Log.Models;

namespace Settlement.Log.Services;

public interface LogDetailService
{
    Task<List<LogDetailsModels>> GetLogDetailByMatchAndProduct(int matchId, string productType);
}

public class LogDetailServiceImp : LogDetailService
{
    private readonly IDynamicRepository repository;

    private readonly RemarkService remarkService;

    public LogDetailServiceImp(
        IDynamicRepository repository,
        RemarkService remarkService)
    {
        this.repository = repository;
        this.remarkService = remarkService;
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
}