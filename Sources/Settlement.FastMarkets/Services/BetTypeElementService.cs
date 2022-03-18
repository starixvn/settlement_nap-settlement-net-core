using System.Collections.Generic;
using System.Linq;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;

namespace Settlement.FastMarkets.Services
{
    public interface IBetTypeElementService
    {
        List<BetTypeElement> GetBetTypes(List<BetType> betTypeList, string action);
    }

    public class BetTypeElementServiceImp : IBetTypeElementService
    {
        private const string UnCalculate = "UNDO";

        public List<BetTypeElement> GetBetTypes(List<BetType> betTypeList, string action)
        {
            var betTypes = new List<BetTypeElement>();

            foreach (var betType in betTypeList)
            {
                var betTypeElement = CreateBetTypeElement(betType.FastMarketResults, action);
                betTypes.Add(betTypeElement);
            }

            return betTypes;
        }

        private static string GetResult(FastMarketResult fastMarket, string actionName)
        {
            if (actionName.Equals(UnCalculate))
            {
                return string.Empty;
            }

            if (fastMarket.BetType == FastMarketBetType.TimeMachineMinutes || fastMarket.BetType == FastMarketBetType.TimeMachineHDP)
            {
                return fastMarket.Result.ToString();
            }
            else if (fastMarket.BetType == FastMarketBetType.NextOneMinuteSetPiece)
            {
                return NextOneMinuteSetPiece(fastMarket.ResultItem).ToString();
            }
            else
            {
                return fastMarket.ResultItem.Value.ToString();
            }
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
}