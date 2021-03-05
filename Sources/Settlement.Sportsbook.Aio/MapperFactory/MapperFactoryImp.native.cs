using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory
{
    public class MapperFactoryImp : MapperFactoryBase
    {
        static MapperFactoryImp()
        {
            AddMapperService($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        }
    }
}