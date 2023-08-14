using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Core.Services;

public interface BasketballEventStatusService
{
    string AdjustEventStatusAbandoned(string eventStatus, IEnumerable<ResultDetailBase> resultDetails, int sportType);
}

public class BasketballEventStatusServiceImp : BasketballEventStatusService
{
    private const string Abandoned = "Abandoned";

    public string AdjustEventStatusAbandoned(string eventStatus, IEnumerable<ResultDetailBase> resultDetails, int sportType)
    {
        if (resultDetails == null)
        {
            return eventStatus;
        }

        var resultDetailSorted = resultDetails.OrderBy(resultDetail =>
            ResourcePosition.ResourceBySport[sportType].IndexOf(resultDetail.ResourceId)).ToList();

        var statusRound = GetStatusRound(eventStatus, resultDetailSorted);
        return statusRound == eventStatus ? GetStatusFinal(eventStatus, resultDetailSorted) : statusRound;
    }

    private static string GetStatusRound(string eventStatus, IEnumerable<ResultDetailBase> resultDetails)
    {
        var resultRounds = resultDetails.Where(resultDetail => resultDetail.ResourceId is not (ResourceType.Final or ResourceType.Halftime));
        var firstResultAbandoned = resultRounds.FirstOrDefault(item => item.SettlementStatusId == SettlementStatus.Abandoned);
        return firstResultAbandoned != null ? $"{Abandoned} {firstResultAbandoned.ResourceId}" : eventStatus;
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
        return $"{Abandoned} {resource}";
    }
}