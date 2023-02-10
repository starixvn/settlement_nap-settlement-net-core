using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.ProviderManager;
using Settlement.Setting.Models;
using Settlement.Setting.Models.ProviderManager;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.ProviderManager;

namespace Settlement.Setting.Services;

public interface ProviderSettingService
{
    Task<List<ProviderModel>> GetProvider(GetProviderRequest query);

    Task<Result> UpdateProvider(UpdateProviderRequest query);
}

public class ProviderSettingServiceImp : ProviderSettingService
{
    private readonly IDynamicRepository repository;

    private readonly XmlConvertService xmlConvertService;

    private readonly IMapper mapper;

    public ProviderSettingServiceImp(IDynamicRepository repository, XmlConvertService xmlConvertService, IMapper mapper)
    {
        this.repository = repository;
        this.xmlConvertService = xmlConvertService;
        this.mapper = mapper;
    }

    public async Task<List<ProviderModel>> GetProvider(GetProviderRequest query)
    {
        var criteria = mapper.Map<GetProviderRequest, GetProviderCriteria>(query);

        var providers = await repository.FetchAsync<ProviderModel>(criteria);

        return providers.ToList();
    }

    public async Task<Result> UpdateProvider(UpdateProviderRequest query)
    {
        var resources = CreateResources(query.Providers);
        var criteria = mapper.Map<UpdateProviderRequest, UpdateProviderCriteria>(query);
        criteria.ProviderSources = resources;

        await repository.ExecuteAsync(criteria);
        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private string CreateResources(List<ProviderModel> selectedResources)
    {
        var resources = new ProviderResources<ProviderModel>
        {
            ProviderItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }
}