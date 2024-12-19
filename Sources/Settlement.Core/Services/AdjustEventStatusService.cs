using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Core.Services;

public interface AdjustEventStatusService
{
    string EventStatusAbandoned(string eventStatus, IEnumerable<ResultDetailBase> resultDetails, int sportType);
}

public class AdjustEventStatusServiceImp : AdjustEventStatusService
{
    public string EventStatusAbandoned(string eventStatus, IEnumerable<ResultDetailBase> resultDetails, int sportType)
    {
        if (resultDetails == null)
        {
            return eventStatus;
        }

        var resultDetailSorted = resultDetails.OrderBy(resultDetail =>
            ResourcePosition.ResourceBySport[sportType].IndexOf(resultDetail.ResourceId)).ToList();

        var statusRound = GetStatusRound(sportType, eventStatus, resultDetailSorted);
        return statusRound == eventStatus ? GetStatusFinal(eventStatus, resultDetailSorted) : statusRound;
    }

    private static string GetStatusRound(int sportType, string eventStatus, IEnumerable<ResultDetailBase> resultDetails)
    {
        var resultRounds = resultDetails
            .Where(resultDetail => resultDetail.ResourceId is not (ResourceType.Final or ResourceType.Halftime))
            .ToList();

        var firstResultAbandoned = resultRounds.Find(item => item.SettlementStatusId == SettlementStatus.Abandoned);

        return firstResultAbandoned != null ? GenerateAbandonedBySportType(sportType, firstResultAbandoned.ResourceId) : eventStatus;
    }

    private static string GenerateAbandonedBySportType(int sportType, string resourceId)
    {
        return sportType switch
        {
            SportType.BasketBall => $"{EventStatus.Abandoned} {resourceId}",
            SportType.BaseBall => GetSpecialResource(resourceId),
            _ => string.Empty
        };
    }

    private static string GetSpecialResource(string resourceId)
    {
        if (resourceId.Equals(ResourceType.ExtraInning))
        {
            return $"{EventStatus.Abandoned} Extra Inning";
        }

        const int startIndex = 2;
        var position = Convert.ToInt32(resourceId[startIndex..]);
        return $"{EventStatus.Abandoned} {position}{GetSuffix(position)} Inning";
    }

    private static string GetSuffix(int position)
    {
        const int one = 1;
        const int two = 2;
        const int three = 3;
        return position switch
        {
            one => "st",
            two => "nd",
            three => "rd",
            _ => "th"
        };
    }

    private static string GetStatusFinal(string eventStatus, IEnumerable<ResultDetailBase> resultDetails)
    {
        var resultFinal = resultDetails.Where(resultDetail => resultDetail.ResourceId is ResourceType.Final or ResourceType.Halftime);
        var finalResultAbandoned = resultFinal.FirstOrDefault(item => item.SettlementStatusId == SettlementStatus.Abandoned);
        if (finalResultAbandoned == null)
        {
            return eventStatus;
        }
        var resource = finalResultAbandoned.ResourceId == ResourceType.Halftime ? "HT" : "FT";
        return $"{EventStatus.Abandoned} {resource}";
    }
}