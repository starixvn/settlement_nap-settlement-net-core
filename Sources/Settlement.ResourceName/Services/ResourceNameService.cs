using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services;

public interface IResourceNameService
{
    public (string, string) GetResourceName(string resourceId, string sportKey, int sportType = 0);
}

public class ResourceNameService : IResourceNameService
{
    private readonly IMapperFactory mapperFactory;

    public ResourceNameService(IMapperFactory mapperFactory)
    {
        this.mapperFactory = mapperFactory;
    }

    public (string, string) GetResourceName(string resourceId, string sportKey, int sportType = 0)
    {
        var providerService = mapperFactory.GetMapperService(sportKey);

        return providerService.GetResourceName(resourceId, sportType);
    }
}