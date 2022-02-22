using Fanex.RemotingRef;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Services.Basketball
{
    public class ResultDetailMapperServiceImp : IMapperService
    {
        private readonly IBasketballBetTypeService basketballBetTypeService;

        public ResultDetailMapperServiceImp()
        {
            var remotingRefService = new RemotingRefService();
            var refDataService = new RefDataService(remotingRefService);
            var groupBetTypeService = new GroupBetTypeServiceImp();
            basketballBetTypeService = new BasketballBetTypeServiceImp(refDataService, groupBetTypeService);
        }

        public void Decorate(dynamic obj)
        {
            const int maxLengthResourceId = 2;
            var list = obj as List<ResultDetail>;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            var listQuarter = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listQuarter.ForEach(x => basketballBetTypeService.CheckValue(x));
            listEarly.ForEach(x => basketballBetTypeService.GetBetTypeNameAndGroup(x));
        }
    }
}