namespace Settlement.ResourceInfos.MapperFactory;

public interface IMapperFactory
{
    IMapperService GetMapperService(string apiKey);
}

public class MapperFactoryBase : IMapperFactory
{
    public virtual IMapperService GetMapperService(string apiKey)
    {
        return MapperServiceDictionary.MapperServices.TryGetValue(apiKey, out var service) ?
            Activator.CreateInstance(service) as IMapperService : null;
    }
}