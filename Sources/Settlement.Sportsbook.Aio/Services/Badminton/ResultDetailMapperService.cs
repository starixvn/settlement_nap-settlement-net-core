using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Badminton;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IBadmintonBetTypeService badmintonBetTypeService;

    public ResultDetailMapperServiceImp()
    {
        badmintonBetTypeService = new BadmintonBetTypeServiceImp();
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