using Settlement.BetTypeName.Constants;
using Settlement.BetTypeName.Services;
using Settlement.Sportsbook.Aio.Constants.Volleyball;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball;

public class ResultDetailMapperServiceImp : IMapperService
{
    private readonly IBetTypeNameService betTypeNameService;

    private readonly IGroupBetTypeService groupBetTypeService;

    public ResultDetailMapperServiceImp()
    {
        betTypeNameService = new BetTypeNameService(new BetTypeName.MapperFactory.MapperFactoryBase());
        groupBetTypeService = new GroupBetTypeServiceImp();
    }

    public void Decorate(dynamic obj)
    {
        if (obj is List<ResultDetail> list)
        {
            const int totalResultIdLength = 2;
            const int betTypeLength = 4;
            var listEarly = list.Where(x => x.ResourceId.Length > totalResultIdLength && !GroupBetType.Main.Contains(SplitBetType(x.ResourceId, 0, betTypeLength))).ToList();
            foreach (var resultDetail in listEarly)
            {
                var betTypeId = SplitBetType(resultDetail.ResourceId, 0, betTypeLength);
                groupBetTypeService.SetGroupNameAndInputType(resultDetail, betTypeId);
                resultDetail.BetTypeName = betTypeNameService.GetBetTypeName(resultDetail.ResourceId, KeyConstants.VolleyballKey);
            }
        }
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}