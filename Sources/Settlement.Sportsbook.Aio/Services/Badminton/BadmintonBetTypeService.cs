using Settlement.BetTypeName.Constants;
using Settlement.BetTypeName.Services;
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

    private readonly IBetTypeNameService betTypeNameService;

    public BadmintonBetTypeServiceImp(IBetTypeNameService betTypeNameService)
    {
        this.betTypeNameService = betTypeNameService;
    }

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(ThreePosition, MapCharacter));
        item.BetType = resourceId[..BetTypeCharacter];
        item.BetTypeName = betTypeNameService.GetBetTypeName(resourceId, KeyConstants.BadmintonKey);

        return item;
    }
}