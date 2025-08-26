using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IBasketballBetTypeService basketballBetTypeService;

    public ResultDetailMapperServiceImp()
    {
        var resourceNameService = new ResourceNameService(new MapperFactoryBase());
        var groupBetTypeService = new GroupBetTypeServiceImp();
        var dynamicRepository = new DynamicRepository();
        var inputTypeService = new InputTypeService();
        basketballBetTypeService = new BasketballBetTypeServiceImp(groupBetTypeService, resourceNameService, dynamicRepository, inputTypeService);
    }

    public async Task Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 2;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            var listQuarter = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listQuarter.ForEach(x => basketballBetTypeService.CheckValue(x));
            await basketballBetTypeService.GetBetTypeNameAndGroup(listEarly);
        }
    }
}