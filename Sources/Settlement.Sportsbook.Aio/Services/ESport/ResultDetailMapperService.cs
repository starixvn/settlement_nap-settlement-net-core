using Fanex.RemotingRef;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.ESport;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IEarlyBetTypeNameService earlyBetTypeNameService;

    public ResultDetailMapperServiceImp()
    {
        var remotingRefService = new RemotingRefService();
        var refDataService = new RefDataService(remotingRefService);
        earlyBetTypeNameService = new EarlyBetTypeNameServiceImp(refDataService);
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