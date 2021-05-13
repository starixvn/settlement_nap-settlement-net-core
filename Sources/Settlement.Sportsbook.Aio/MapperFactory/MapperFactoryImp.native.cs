using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory
{
    public class MapperFactoryImp : MapperFactoryBase
    {
        static MapperFactoryImp()
        {
            AddMapperService($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
            AddMapperService($"cricket-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
            AddMapperService($"cricket-{ApiKeyConstant.ResultDetailKey}", typeof(Services.Cricket.ResultDetailMapperServiceImp));
            AddMapperService($"esport-{ApiKeyConstant.ProviderKey}", typeof(Services.ESport.ProviderMapperService));
            AddMapperService($"esport-{ApiKeyConstant.ResultDetailKey}", typeof(Services.ESport.ResultDetailMapperServiceImp));

        }
    }
}