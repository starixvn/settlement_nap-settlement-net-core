namespace Settlement.ResourceInfos.MapperFactory;

public interface IMapperFactory
{
    IMapperService GetMapperService(string apiKey);
}

public class MapperFactoryBase : IMapperFactory
{
    public virtual IMapperService GetMapperService(string apiKey)
    {
        return MapperServiceDictionary.MapperServices.ContainsKey(apiKey) ?
            Activator.CreateInstance(MapperServiceDictionary.MapperServices[apiKey]) as IMapperService : null;
    }
}