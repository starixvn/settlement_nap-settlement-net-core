using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Cricket;

public class CricketResourceNameService : IMapperService
{
    private readonly IResourceNameService betTypeNameService = new ResourceNameService();
    private const int InnsBetTypeMinLength = 5;
    private const int ResourceMainLength = 2;

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        switch (resourceId.Length)
        {
            case ResourceMainLength:
                return (resourceId, GetResourceMain(resourceId));
            case < InnsBetTypeMinLength:
            {
                var betTypeId = Convert.ToInt32(resourceId);
                return (betTypeId.ToString(), betTypeNameService.GetNonInnsBetTypeName(betTypeId));
            }
            default:
            {
                var betTypeId = SplitBetType(resourceId, 0, 4);
                return (betTypeId.ToString(), betTypeNameService.GetInnsBetTypeName(betTypeId, resourceId));
            }
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