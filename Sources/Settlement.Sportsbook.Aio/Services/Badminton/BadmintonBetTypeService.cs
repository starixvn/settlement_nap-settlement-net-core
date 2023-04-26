using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Badminton;

public interface IBadmintonBetTypeService
{
    ResultDetail GetBetTypeName(ResultDetail item);
}

public class BadmintonBetTypeServiceImp : IBadmintonBetTypeService
{
    private const int BetTypeCharacter = 3;
    private const int ThreePosition = 3;
    private const int MapCharacter = 2;

    private readonly IResourceNameService resourceNameService;

    public BadmintonBetTypeServiceImp(IResourceNameService resourceNameService)
    {
        this.resourceNameService = resourceNameService;
    }

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(ThreePosition, MapCharacter));
        item.BetType = resourceId[..BetTypeCharacter];
        item.BetTypeName = resourceNameService.GetResourceName(resourceId, KeyConstants.BadmintonKey);

        return item;
    }
}