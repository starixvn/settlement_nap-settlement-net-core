using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly ICricketBetTypeService earlyBetTypeNameService;

    public ResultDetailMapperServiceImp()
    {
        var repository = new DynamicRepository();
        var resourceNameService = new ResourceNameService(new MapperFactoryBase());
        var inputTypeService = new InputTypeServiceImp();
        var groupNameService = new GroupNameServiceImp();
        earlyBetTypeNameService = new CricketBetTypeService(repository, resourceNameService, groupNameService, inputTypeService);
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 2;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            earlyBetTypeNameService.GroupBetTypesAndGenerateNames(listEarly);
        }
    }
}