using Settlement.Models;
using Settlement.Sportsbook.Aio.MapperFactory;

namespace Settlement.Sportsbook.Aio.Services;

public class ProviderMapperService : IMapperService
{
    public void Decorate(dynamic obj)
    {
        var (externalResultDetails, externalResultModel) = (Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>)obj;
        var externalResults = new List<ExternalResultModel>();
        externalResults.AddRange(GroupExternalResults(externalResultDetails));
        externalResultModel.AddRange(externalResults);
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