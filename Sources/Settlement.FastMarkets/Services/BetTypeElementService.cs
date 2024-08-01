using Settlement.Core.Constants;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using BetType = Settlement.FastMarkets.Models.BetType;

namespace Settlement.FastMarkets.Services;

public interface IBetTypeElementService
{
    List<BetTypeElement> GetBetTypes(List<BetType> betTypeList, string action);
}

public class BetTypeElementServiceImp : IBetTypeElementService
{
    public List<BetTypeElement> GetBetTypes(List<BetType> betTypeList, string action)
    {
        return betTypeList.Select(betType => CreateBetTypeElement(betType.FastMarketResults, action)).ToList();
    }

    private static string GetResult(FastMarketResult fastMarket, string actionName)
    {
        if (actionName.Equals(ActionType.UnCalculate))
        {
            return string.Empty;
        }

        if (fastMarket.BetType is FastMarketBetType.TimeMachineMinutes or FastMarketBetType.TimeMachineHdp)
        {
            return fastMarket.Result.ToString();
        }

        return fastMarket.BetType == FastMarketBetType.NextOneMinuteSetPiece ? NextOneMinuteSetPiece(fastMarket.ResultItem).ToString() : fastMarket.ResultItem.Value.ToString();
    }

    private static int NextOneMinuteSetPiece(ResultItem item)
    {
        return item.Goal ? SetPiece.CornerFreeKickGoalKickAndPenalty : item.Value;
    }

    private BetTypeElement CreateBetTypeElement(List<FastMarketResult> fastMarkets, string actionName)
    {
        var items = fastMarkets.Select(x => CreateItemElement(x, actionName)).ToList();
        var betTypeId = 0;
        var firstItem = fastMarkets.FirstOrDefault();

        if (firstItem != null)
        {
            betTypeId = firstItem.BetType;
        }

        return new BetTypeElement
        {
            Id = betTypeId,
            Items = items
        };
    }

    private ItemElement CreateItemElement(FastMarketResult fastMarket, string actionName)
    {
        var result = GetResult(fastMarket, actionName);

        return new ItemElement
        {
            Position = fastMarket.Position,
            Result = result
        };
    }
}