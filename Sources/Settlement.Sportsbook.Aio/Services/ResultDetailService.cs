using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services;

public interface ResultDetailService
{
    Task SetInterval(int sportType, List<ResultDetail> resultDetails);
}

public class ResultDetailServiceImp : ResultDetailService
{
    private readonly IDynamicRepository repository;

    public ResultDetailServiceImp(IDynamicRepository repository)
    {
        this.repository = repository;
    }

    public async Task SetInterval(int sportType, List<ResultDetail> resultDetails)
    {
        var indexes = (await GetResourceIndex(sportType)).ToList();

        resultDetails.ForEach(s => s.IntervalNo = indexes.First(i => i.ResourceId == s.ResourceId).IntervalNo);
    }

    private async Task<IEnumerable<ResourceIndex>> GetResourceIndex(int sportType)
    {
        var criteria = new GetResourceIndexCriteria { SportType = sportType };

        var indexes = await repository.FetchAsync<ResourceIndex>(criteria);
        return indexes.Where(r => r.ResourceId != ResourceType.Final).ToList();
    }
}