using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory;

public class MapperFactoryImp : MapperFactoryBase
{
    static MapperFactoryImp()
    {
        AddMapperService($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        AddMapperService($"cricket-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        AddMapperService($"cricket-{ApiKeyConstant.ResultDetailKey}", typeof(Services.Cricket.ResultDetailMapperServiceImp));
        AddMapperService($"esport-{ApiKeyConstant.ProviderKey}", typeof(Services.ESport.ProviderMapperService));
        AddMapperService($"esport-{ApiKeyConstant.ResultDetailKey}", typeof(Services.ESport.ResultDetailMapperServiceImp));
        AddMapperService($"badminton-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        AddMapperService($"badminton-{ApiKeyConstant.ResultDetailKey}", typeof(Services.Badminton.ResultDetailMapperServiceImp));
        AddMapperService($"basketball-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        AddMapperService($"basketball-{ApiKeyConstant.ResultDetailKey}", typeof(Services.Basketball.ResultDetailMapperServiceImp));
        AddMapperService($"game-total-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
        AddMapperService($"game-total-{ApiKeyConstant.ChildMatchKey}", typeof(Services.Volleyball.ChildMatchService));
        AddMapperService($"game-total-{ApiKeyConstant.ResultDetailKey}", typeof(Services.Volleyball.ResultDetailMapperServiceImp));
    }
}