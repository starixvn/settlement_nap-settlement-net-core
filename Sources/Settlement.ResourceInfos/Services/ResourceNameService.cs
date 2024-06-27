using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services;

public interface IResourceNameService
{
    public (string, string) GetResourceName(string resourceId, string sportKey, int sportType = 0);
}

public class ResourceNameService(IMapperFactory mapperFactory) : IResourceNameService
{
    public (string, string) GetResourceName(string resourceId, string sportKey, int sportType = 0)
    {
        var providerService = mapperFactory.GetMapperService(sportKey);

        return providerService.GetResourceName(resourceId, sportType);
    }
}