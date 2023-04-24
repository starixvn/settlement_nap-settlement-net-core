using Settlement.BetTypeName.MapperFactory;

namespace Settlement.BetTypeName.Services;

public interface IBetTypeNameService
{
    public string GetBetTypeName(string resourceId, string sportKey);
}

public class BetTypeNameService : IBetTypeNameService
{
    private readonly IMapperFactory mapperFactory;

    public BetTypeNameService(IMapperFactory mapperFactory)
    {
        this.mapperFactory = mapperFactory;
    }

    public string GetBetTypeName(string resourceId, string sportKey)
    {
        var providerService = mapperFactory.GetMapperService(sportKey);

        return providerService.GetResourceName(resourceId);
    }
}