using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly ICricketBetTypeService earlyBetTypeNameService;

    public ResultDetailMapperServiceImp()
    {
        var repository = new DynamicRepository();
        var betTypeNameService = new BetTypeNameServiceImp();
        var inputTypeService = new InputTypeServiceImp();
        var groupNameService = new GroupNameServiceImp();
        earlyBetTypeNameService = new CricketBetTypeService(repository, betTypeNameService, groupNameService, inputTypeService);
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