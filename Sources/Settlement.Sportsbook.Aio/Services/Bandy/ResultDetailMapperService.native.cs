using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Constants.Volleyball;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Bandy;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IResourceNameService resourceNameService;

    public ResultDetailMapperServiceImp()
    {
        resourceNameService = new ResourceNameService(new ResourceInfos.MapperFactory.MapperFactoryBase());
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
        }
    }
}