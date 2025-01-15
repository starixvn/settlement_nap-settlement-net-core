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
        const string prefixEarlyBaseball = "88";
        var resourceNameService = new ResourceNameService(new MapperFactoryBase());
        if (obj is List<ResultDetail> list)
        {
            var listEarly = list.Where(x => x.ResourceId.StartsWith(prefixEarlyBaseball)).ToList();
            listEarly.ForEach(x =>
            {
                (x.BetType, x.BetTypeName) = resourceNameService.GetResourceName(x.ResourceId, KeyConstants.BaseballKey);
                x.InputType = GetInputType(x.BetType);
            });
        }
    }

    private static int GetInputType(string betType)
    {
        var betTypeId = Convert.ToInt32(betType);

        if (InputType.CoupleScore.Contains(betTypeId))
        {
            return InputType.CoupleScoreId;
        }

        return InputType.YesNo.Contains(betTypeId) ? InputType.YesNoId : InputType.HomeAwayId;
    }
}