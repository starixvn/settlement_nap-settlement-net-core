using Settlement.Sportsbook.Aio.Mapper;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Cricket
{
    public class ResultDetailMapperService: IMapperService
    {
        private readonly ICricketBetTypeService cricketBetTypeService;

        public ResultDetailMapperService()
        {
            cricketBetTypeService = new CricketBetTypeService();
        }

        public void Decorate(dynamic obj)
        {
            var list = obj as List<MatchResultDetail>;
            cricketBetTypeService.GroupBetTypesAndGenerateNames(list);
        }
    }
}
