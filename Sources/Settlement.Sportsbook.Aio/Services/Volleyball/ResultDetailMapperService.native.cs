using Settlement.Sportsbook.Aio.Constants.Volleyball;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Services.Volleyball
{
    public class ResultDetailMapperServiceImp : IMapperService
    {
        private readonly IEarlyBetTypeNameService earlyBetTypeNameService;

        private readonly IGroupBetTypeService groupBetTypeService;

        public ResultDetailMapperServiceImp()
        {
            groupBetTypeService = new GroupBetTypeServiceImp();
            earlyBetTypeNameService = new EarlyBetTypeNameServiceImp();
        }

        public void Decorate(dynamic obj)
        {
            const int totalResultIdLength = 2;
            const int betTypeLength = 4;
            var list = obj as List<ResultDetail>;
            var listEarly = list.Where(x => x.ResourceId.Length > totalResultIdLength && !GroupBetType.Main.Contains(SplitBetType(x.ResourceId, 0, betTypeLength))).ToList();
            foreach (var resultDetail in listEarly)
            {
                var betTypeId = SplitBetType(resultDetail.ResourceId, 0, betTypeLength);
                groupBetTypeService.SetGroupNameAndInputType(resultDetail, betTypeId);
                earlyBetTypeNameService.SetBetTypeName(resultDetail, betTypeId);
            }
        }

        private static int SplitBetType(string resourceId, int startIndex, int length)
        {
            return Convert.ToInt32(resourceId.Substring(startIndex, length));
        }
    }
}
