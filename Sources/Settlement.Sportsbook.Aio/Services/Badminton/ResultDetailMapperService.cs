using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.Badminton;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IBadmintonBetTypeService badmintonBetTypeService;

    public ResultDetailMapperServiceImp()
    {
        var resourceNameService = new ResourceNameService(new MapperFactoryBase());
        badmintonBetTypeService = new BadmintonBetTypeServiceImp(resourceNameService);
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int maxLengthResourceId = 7;
            var listEarly = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listEarly.ForEach(x => badmintonBetTypeService.GetBetTypeName(x));
        }
    }
}