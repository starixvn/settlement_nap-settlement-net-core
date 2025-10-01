using Fanex.RemotingRef;
using Settlement.Core.Services;
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
        var refDataService = new RefDataService(new RemotingRefService());
        var generateBetTypeNameService = new GenerateBetTypeNameService(refDataService);
        basketballBetTypeService = new BasketballBetTypeServiceImp(groupBetTypeService, resourceNameService, dynamicRepository, inputTypeService, generateBetTypeNameService);
    }

    public async Task Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 2;
            var listQuarter = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listQuarter.ForEach(x => basketballBetTypeService.CheckValue(x));

            await basketballBetTypeService.GetOddFlex(list);
            basketballBetTypeService.RemoveDuplicatedResources(list);

            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            basketballBetTypeService.GroupingBettype(listEarly);
        }
    }
}