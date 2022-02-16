using System.Collections.Generic;
using System.Linq;
using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket
{
    public class ResultDetailMapperServiceImp : IMapperService
    {
        private readonly ICricketBetTypeService earlyBetTypeNameService;

        public ResultDetailMapperServiceImp()
        {
            var repository = new DynamicRepository();
            earlyBetTypeNameService = new CricketBetTypeService(repository);
        }

        public void Decorate(dynamic obj)
        {
            const int maxLengthResourceId = 2;
            var list = obj as List<ResultDetail>;
            var listEarly = list.Where(x => x.ResourceId.Length > maxLengthResourceId).ToList();
            earlyBetTypeNameService.GroupBetTypesAndGenerateNames(listEarly);
        }
    }
}