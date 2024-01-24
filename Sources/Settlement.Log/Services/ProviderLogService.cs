using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;

namespace Settlement.Log.Services;

public interface ProviderLogService
{
    Task<IEnumerable<ProviderName>> GetProviderName();

    Task<IEnumerable<ProviderResultLog>> GetProviderLog(ProviderLogRequest request);
}

public class ProviderLogServiceImp : ProviderLogService
{
    private readonly IMapper mapper;

    private readonly IDynamicRepository repository;

    public ProviderLogServiceImp(
        IDynamicRepository repository,
        IMapper mapper)
    {
        this.repository = repository;
        this.mapper = mapper;
    }

    public async Task<IEnumerable<ProviderName>> GetProviderName()
    {
        var criteria = new GetProviderNameCriteria();
        return await repository.FetchAsync<ProviderName>(criteria);
    }

    public async Task<IEnumerable<ProviderResultLog>> GetProviderLog(ProviderLogRequest request)
    {
        var criteria = mapper.Map<ProviderLogRequest, GetProviderLogCriteria>(request);
        return await repository.FetchAsync<ProviderResultLog>(criteria);
    }
}