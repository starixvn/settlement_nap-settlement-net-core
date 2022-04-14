using Settlement.Core.Services;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.FastMarkets.Services
{
    public interface IFastMarketBetTypeService
    {
        List<BetType> BetTypesList(List<FastMarketResult> fastMarkets, string odds);
    }

    public class FastMarketBetTypeServiceImp : IFastMarketBetTypeService
    {
        private readonly IRefDataService refDataService;

        private readonly IResultLabelService resultLabelService;

        public FastMarketBetTypeServiceImp(IRefDataService refDataService, IResultLabelService resultLabelService)
        {
            this.refDataService = refDataService;
            this.resultLabelService = resultLabelService;
        }

        public List<BetType> BetTypesList(List<FastMarketResult> fastMarkets, string odds)
        {
            return fastMarkets
                .GroupBy(m => m.BetType)
                .Select(m => new BetType { RefDataService = refDataService, BetTypeId = m.Key, ResultName = ResultName(m.Key, odds), FastMarketResults = m.ToList() })
                .OrderBy(m => m.BetTypeId)
                .ToList();
        }

        private ResultItemLabel ResultName(int betType, string odds)
        {
            switch (betType)
            {
                case FastMarketBetType.NextFiveMinutes:
                    return resultLabelService.NextFiveMinutes(odds);

                case FastMarketBetType.NextOneMinuteSetPiece:
                    return resultLabelService.NextOneMinuteSetPiece();

                case FastMarketBetType.TimeMachineHDP:
                    return resultLabelService.TimeMachineHDP();

                default:
                    return new ResultItemLabel();
            }
        }
    }
}