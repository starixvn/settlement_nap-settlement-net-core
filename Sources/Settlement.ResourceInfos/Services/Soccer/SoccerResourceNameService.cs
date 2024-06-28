using Fanex.RemotingRef;
using Settlement.Constants;
using Settlement.Services;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;
using static Settlement.Constants.BetType;

namespace Settlement.ResourceInfos.Services.Soccer;

public class SoccerResourceNameService : IMapperService
{
    private const int MaxLengthResourceId = 3;

    private readonly IRefDataService refDataService;

    public SoccerResourceNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        if (resourceId.Length < MaxLengthResourceId
            || resourceId.Contains(ResourceType.FullTimeFirstGoal)
            || resourceId.Contains(ResourceType.FullTimeLastGoal))
        {
            return (resourceId, GetResourceMain(resourceId));
        }

        var betType = resourceId[..MaxLengthResourceId];

        var isNumber = int.TryParse(betType, out _);
        if (isNumber)
        {
            var betTypeId = Convert.ToInt32(betType);
            var resourceName = GetResourceEarly(betTypeId, resourceId);
            return (betType, resourceName);
        }

        return (resourceId, resourceId);
    }

    private static string GetResourceMain(string resourceId)
    {
        return resourceId switch
        {
            ResourceType.Halftime => ResourceNameConstants.HalfTime,
            ResourceType.Final => ResourceNameConstants.FullTime,
            ResourceType.FullTimeGoalRecord => ResourceNameConstants.FullTimeGoalRecord,
            ResourceType.HalftimeGoalRecord => ResourceNameConstants.HalftimeGoalRecord,
            ResourceType.FullTimeFirstGoal => ResourceNameConstants.FirstLastGoal,
            ResourceType.FullTimeLastGoal => ResourceNameConstants.FirstLastGoal,
            _ => string.Empty
        };
    }

    private string GetResourceEarly(int betTypeId, string resourceId)
    {
        return betTypeId switch
        {
            SoccerBetType.ExtraTimeNextGoal => $"Goal {Convert.ToUInt32(Round(resourceId))}",
            SoccerBetType.PenaltyShootoutBothOneNeither or SoccerBetType.PenaltyShootout1X2
                or SoccerBetType.PenaltyWoodwork or SoccerBetType.HomePenaltyShootout
                or SoccerBetType.AwayPenaltyShootout => refDataService.GetBetTypeName(betTypeId, Round(resourceId)),
            SoccerBetType.HomePenaltyShootoutOverUnder => "Penalty Shootout First 10 - Home Score",
            SoccerBetType.AwayPenaltyShootoutOverUnder => "Penalty Shootout First 10 - Away Score",
            _ => refDataService.GetBetTypeName(betTypeId)
        };
    }

    private static string Round(string resourceId)
    {
        const int pos = 3;
        const int maxLength = 2;
        return resourceId.Substring(pos, maxLength);
    }
}