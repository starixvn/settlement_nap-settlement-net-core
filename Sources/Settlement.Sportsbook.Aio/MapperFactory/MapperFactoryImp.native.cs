using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory
{
    public class MapperFactoryImp : MapperFactoryBase
    {
        static MapperFactoryImp()
        {
            AddMapperService($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
            AddMapperService($"cricket-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
            AddMapperService($"cricket-{ApiKeyConstant.ResultDetailKey}", typeof(Cricket.ResultDetailMapperServiceImp));
            AddMapperService($"esport-{ApiKeyConstant.ProviderKey}", typeof(ESport.ProviderMapperService));
            AddMapperService($"esport-{ApiKeyConstant.ResultDetailKey}", typeof(ESport.ResultDetailMapperServiceImp));

        }
    }
}