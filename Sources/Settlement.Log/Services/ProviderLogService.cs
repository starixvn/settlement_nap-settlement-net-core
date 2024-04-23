using System.ComponentModel;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;

namespace Settlement.Log.Services;

public interface ProviderLogService
{
    Task<IEnumerable<ProviderName>> GetProviderName();

    Task<IEnumerable<ResultLog>> GetProviderLog(ProviderLogRequest request, int sportType);

    Task<MatchDetail> GetMatchDetail(int matchId);
}

public class ProviderLogServiceImp : ProviderLogService
{
    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    private readonly IDynamicRepository repository;

    private readonly IResourceNameService resourceNameService;

    public ProviderLogServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        IRefDataService refDataService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.refDataService = refDataService;
        resourceNameService = new ResourceNameService(new MapperFactoryBase());
    }

    public async Task<MatchDetail> GetMatchDetail(int matchId)
    {
        var criteria = new GetMatchInfoCriteria
        {
            MatchId = matchId
        };

        var match = await repository.GetAsync<MatchDetail>(criteria);
        if (match != null)
        {
            match.RefDataService = refDataService;
        }

        return match;
    }

    public async Task<IEnumerable<ProviderName>> GetProviderName()
    {
        var criteria = new GetProviderNameCriteria();
        return await repository.FetchAsync<ProviderName>(criteria);
    }

    public async Task<IEnumerable<ResultLog>> GetProviderLog(ProviderLogRequest request, int sportType)
    {
        var resultLogs = await GetProviderLogs(request);

        var traderLogs = await GetTraderConfirmLog(request.MatchId, resultLogs);

        var logs = resultLogs.Concat(traderLogs).ToList();
        var listResultLogs = GenerateResourceName(logs, sportType);

        return listResultLogs
            .Where(item =>
                (item.ResourceName ?? string.Empty).Contains(request.ResourceName.Trim(), StringComparison.InvariantCultureIgnoreCase));
    }

    private IEnumerable<ResultLog> GenerateResourceName(List<ResultLog> resultLogs, int sportType)
    {
        var key = KeyConstants.KeyDictionary.TryGetValue(sportType, out var value)
            ? value
            : KeyConstants.KeyDictionary[0];

        resultLogs.ForEach(log =>
        {
            (_, log.ResourceName) = resourceNameService.GetResourceName(log.ResourceId, key, sportType);
        });

        return resultLogs;
    }

    private async Task<List<ResultLog>> GetProviderLogs(ProviderLogRequest request)
    {
        var criteria = mapper.Map<ProviderLogRequest, GetProviderLogCriteria>(request);
        var resultLogs = (await repository.FetchAsync<ResultLog>(criteria)).ToList();
        resultLogs.ForEach(x => { x.Action = x.SourceName.Equals("-") ? "Auto Payout" : "received"; });

        return resultLogs;
    }

    private async Task<List<ResultLog>> GetTraderConfirmLog(int matchId, List<ResultLog> resultLogs)
    {
        var resourceIds = string.Join(",", resultLogs.Select(x => x.ResourceId).Distinct());
        var criteria = new TraderConfirmSelCriteria { MatchId = matchId, ResourceIDs = resourceIds };

        var result = await repository.FetchAsync<ResultLog>(criteria);

        result.ToList().ForEach(log => { log.Action = "confirmed"; });

        return result.ToList();
    }
}