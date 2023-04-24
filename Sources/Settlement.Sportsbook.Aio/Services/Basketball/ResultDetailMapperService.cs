using Settlement.BetTypeName.MapperFactory;
using Settlement.BetTypeName.Services;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IBasketballBetTypeService basketballBetTypeService;

    public ResultDetailMapperServiceImp()
    {
        var betTypeNameService = new BetTypeNameService(new MapperFactoryBase());
        var groupBetTypeService = new GroupBetTypeServiceImp();
        basketballBetTypeService = new BasketballBetTypeServiceImp(groupBetTypeService, betTypeNameService);
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 2;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            var listQuarter = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listQuarter.ForEach(x => basketballBetTypeService.CheckValue(x));
            listEarly.ForEach(x => basketballBetTypeService.GetBetTypeNameAndGroup(x));
        }
    }
}