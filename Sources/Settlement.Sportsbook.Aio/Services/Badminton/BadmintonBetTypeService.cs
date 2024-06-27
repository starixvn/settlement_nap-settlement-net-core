using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Badminton;

public interface IBadmintonBetTypeService
{
    ResultDetail GetBetTypeName(ResultDetail item);
}

public class BadmintonBetTypeServiceImp(IResourceNameService resourceNameService) : IBadmintonBetTypeService
{
    private const int ThreePosition = 3;
    private const int MapCharacter = 2;

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(ThreePosition, MapCharacter));
        (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(resourceId, KeyConstants.BadmintonKey);

        return item;
    }
}