using Settlement.Sportsbook.Aio.MapperFactory;
using System;
using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Services
{
    public class ProviderMapperService : IMapperService
    {
        public void Decorate(dynamic obj)
        {
            var tuple = obj as Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>;
            var externalResultDetails = tuple.Item1;
            var externalResults = new List<ExternalResultModel>();
            externalResults.AddRange(GroupExternalResults(externalResultDetails));
            tuple.Item2.AddRange(externalResults);
        }

        private List<ExternalResultModel> GroupExternalResults(IEnumerable<ExternalResultDetailModel> resultDetails)
        {
            return resultDetails.GroupBy(resultDetail => new { resultDetail.SourceId, resultDetail.SourceName, resultDetail.OrderNo, resultDetail.Remark })
                                .Select(resultDetail => new ExternalResultModel
                                {
                                    SourceId = resultDetail.Key.SourceId,
                                    SourceName = resultDetail.Key.SourceName,
                                    OrderNo = resultDetail.Key.OrderNo,
                                    Remark = resultDetail.Key.Remark,
                                    ResultDetails = resultDetail.ToList()
                                })
                                .OrderBy(result => result.OrderNo)
                                .ThenBy(result => result.SourceName)
                                .ToList();
        }
    }
}