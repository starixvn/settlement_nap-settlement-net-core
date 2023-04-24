using Settlement.BetTypeName.MapperFactory;
using Settlement.BetTypeName.Services;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.ESport;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IEarlyBetTypeNameService earlyBetTypeNameService;

    public ResultDetailMapperServiceImp()
    {
        var betTypeNameService = new BetTypeNameService(new MapperFactoryBase());
        earlyBetTypeNameService = new EarlyBetTypeNameServiceImp(betTypeNameService);
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 4;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            listEarly.ForEach(x => earlyBetTypeNameService.GetBetTypeName(x));
        }
    }
}