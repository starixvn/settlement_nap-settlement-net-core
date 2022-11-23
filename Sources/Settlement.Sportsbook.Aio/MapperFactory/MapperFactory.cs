namespace Settlement.Sportsbook.Aio.MapperFactory;

public interface IMapperFactory
{
    IMapperService GetMapperService(string apiKey);
}

public class MapperFactoryBase : IMapperFactory
{
    private static readonly Dictionary<string, Type> MapperServices = new Dictionary<string, Type>();

    protected static void AddMapperService(string apiKey, Type type)
    {
        MapperServices.Add(apiKey, type);
    }

    public virtual IMapperService GetMapperService(string apiKey)
    {
        return MapperServices.ContainsKey(apiKey) ? Activator.CreateInstance(MapperServices[apiKey]) as IMapperService : null;
    }
}