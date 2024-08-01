using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Constants.Standard;
using Settlement.Sportsbook.Aio.Models;
using IMapperService = Settlement.Sportsbook.Aio.MapperFactory.IMapperService;

namespace Settlement.Sportsbook.Aio.Services.Standard;

public class ResultDetailMapperServiceImp : IMapperService
{
    public void Decorate(dynamic obj)
    {
        var prefixEarlyBaseball = "88";
        var resourceNameService = new ResourceNameService(new MapperFactoryBase());
        if (obj is List<ResultDetail> list)
        {
            var listEarly = list.Where(x => x.ResourceId.StartsWith(prefixEarlyBaseball)).ToList();
            listEarly.ForEach(x =>
            {
                (x.BetType, x.BetTypeName) = resourceNameService.GetResourceName(x.ResourceId, KeyConstants.BaseballKey);
                x.InputType = getInputType(x.BetType);
            });
        }
    }

    private int getInputType(string betType)
    {
        return InputType.CoupleScore.Contains(Convert.ToInt32(betType)) ? InputType.CoupleScoreId : InputType.HomeAwayId;
    }
}