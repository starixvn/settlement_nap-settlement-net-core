using Settlement.BetTypeName.MapperFactory;

namespace Settlement.BetTypeName.Services.Cricket;

public class CricketBetTypeNameService : IMapperService
{
    private readonly IBetTypeNameService betTypeNameService;
    private const int InnsBetTypeMinLength = 5;

    public CricketBetTypeNameService()
    {
        betTypeNameService = new BetTypeNameServiceImp();
    }

    public string GetResourceName(string resourceId)
    {
        if (resourceId.Length < InnsBetTypeMinLength)
        {
            var betTypeId = Convert.ToInt32(resourceId);
            return betTypeNameService.GetNonInnsBetTypeName(betTypeId);
        }
        else
        {
            var betTypeId = SplitBetType(resourceId, 0, 4);
            return betTypeNameService.GetInnsBetTypeName(betTypeId, resourceId);
        }
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}