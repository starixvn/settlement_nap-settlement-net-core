using Fanex.RemotingRef;
using Settlement.Core.Services;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Baseball;

public class BaseballResourceNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public BaseballResourceNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        var betType = resourceId[..4];

        var customBetTypeName = GetBetTypeName(betType);

        var resourceName = string.IsNullOrEmpty(customBetTypeName)
            ? refDataService.GetBetTypeName(betType, resourceId[4..])
            : GenerateCustomResourceName(resourceId, customBetTypeName);

        return (betType, resourceName);
    }

    private static string GetBetTypeName(string betType) => betType switch
    {
        "8823" => "{0} Inning Total Hits",
        "8827" => "Last Team to Score",
        "8815" => "Extra Inning",
        _ => ""
    };

    private string GenerateCustomResourceName(string resourceId, string betTypeName)
    {
        var inningResource = GetInning(resourceId);
        if (int.TryParse(inningResource, out var inning))
        {
            var ordinal = GenerateOrdinals(inning);
            return string.Format(betTypeName, $"{inning}{ordinal}");
        }

        return betTypeName;
    }

    private static string GetInning(string resourceId)
    {
        const int numberFour = 4;
        return resourceId.Length < 5 ? string.Empty : resourceId[numberFour..];

    }

    private static string GenerateOrdinals(int number)
    {
        var ordinal = number.ToString();
        var lastCharacter = ordinal[^1..];
        return lastCharacter switch
        {
            "1" => "st",
            "2" => "nd",
            "3" => "rd",
            _ => "th"
        };
    }
}