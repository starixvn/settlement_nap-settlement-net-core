using Kaden.XmlConverter;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using System.Collections.Generic;

namespace Settlement.FastMarkets.Services
{
    public interface IFastMarketResultService
    {
        string Result(List<BetType> betTypeList, string action);
    }

    public class FastMarketResultServiceImp : IFastMarketResultService
    {
        private readonly IBetTypeElementService betTypeElementService;

        private readonly XmlConvertService xmlConvertService;

        public FastMarketResultServiceImp(IBetTypeElementService betTypeElementService, XmlConvertService xmlConvertService)
        {
            this.betTypeElementService = betTypeElementService;
            this.xmlConvertService = xmlConvertService;
        }

        public string Result(List<BetType> betTypeList, string action)
        {
            var betType = betTypeElementService.GetBetTypes(betTypeList, action);
            var betTypesRoot = new BetTypesRoot
            {
                BetType = betType
            };

            return xmlConvertService.Serialize(betTypesRoot);
        }
    }
}