using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.Mapper
{
    public class MapperFactoryImp : MapperFactoryBase
    {
        static MapperFactoryImp()
        {
            AddMapperService($"{SportType.Tennis}-{ApiKeyConstant.ProviderKey}", typeof(Services.ProviderMapperService));
            AddMapperService($"{SportType.Cricket}-{ApiKeyConstant.ResultDetailKey}", typeof(Cricket.ResultDetailMapperService));
            AddGetService($"{SportType.Cricket}-{ApiKeyConstant.ChildMatchKey}", typeof(Cricket.ChildMatchService));
        }
    }
}
