using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services;

public interface IResourceNameService
{
    public string GetResourceName(string resourceId, string sportKey);
}

public class ResourceNameService : IResourceNameService
{
    private readonly IMapperFactory mapperFactory;

    public ResourceNameService(IMapperFactory mapperFactory)
    {
        this.mapperFactory = mapperFactory;
    }

    public string GetResourceName(string resourceId, string sportKey)
    {
        var providerService = mapperFactory.GetMapperService(sportKey);

        return providerService.GetResourceName(resourceId);
    }
}