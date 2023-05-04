using Settlement.Core.Constants;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services.Cricket;

public class CricketResourceNameService : IMapperService
{
    private readonly IResourceNameService betTypeNameService;
    private const int InnsBetTypeMinLength = 5;
    private const int ResourceMainLength = 2;

    public CricketResourceNameService()
    {
        betTypeNameService = new ResourceNameService();
    }

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        if (resourceId.Length == ResourceMainLength)
        {
            return (resourceId, GetResourceMain(resourceId));
        }
        if (resourceId.Length < InnsBetTypeMinLength)
        {
            var betTypeId = Convert.ToInt32(resourceId);
            return (betTypeId.ToString(), betTypeNameService.GetNonInnsBetTypeName(betTypeId));
        }
        else
        {
            var betTypeId = SplitBetType(resourceId, 0, 4);
            return (betTypeId.ToString(), betTypeNameService.GetInnsBetTypeName(betTypeId, resourceId));
        }
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }

    private static string GetResourceMain(string resourceId)
    {
        if (resourceId == ResourceType.Final)
        {
            return ResourceNameConstants.MatchWinner;
        }

        if (resourceId[..1] is "A" or "H")
        {
            var inningNumber = resourceId.Substring(1, 1);
            return resourceId[..1] is "A" ? $"Innings {inningNumber} Away" : $"Innings {inningNumber} Home";
        }

        return string.Empty;
    }
}