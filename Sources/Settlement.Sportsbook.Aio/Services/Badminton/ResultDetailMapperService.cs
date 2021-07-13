using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Services.Badminton
{
    public class ResultDetailMapperServiceImp : IMapperService
    {
        private readonly IBadmintonBetTypeService badmintonBetTypeService;

        public ResultDetailMapperServiceImp()
        {
            badmintonBetTypeService = new BadmintonBetTypeServiceImp();
        }

        public void Decorate(dynamic obj)
        {
            const int maxLengthResourceId = 7;
            var list = obj as List<MatchResultDetail>;
            var listEarly = list.Where(x => x.ResourceId.Length == maxLengthResourceId).ToList();
            listEarly.ForEach(x => badmintonBetTypeService.GetBetTypeName(x));
        }
    }
}
