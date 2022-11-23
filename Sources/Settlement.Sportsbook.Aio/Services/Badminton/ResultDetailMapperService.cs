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
        const int maxLengthResourceId = 7;
        var list = obj as List<ResultDetail>;
        var listEarly = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
        listEarly.ForEach(x => badmintonBetTypeService.GetBetTypeName(x));
    }
}