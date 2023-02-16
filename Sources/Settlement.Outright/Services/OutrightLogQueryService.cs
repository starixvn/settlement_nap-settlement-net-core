using Fanex.Data.Repository;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface OutrightLogQueryService
{
	Task<OutrightLog> GetOutrightLog(GetLogRequest request);

	Task<IEnumerable<OutrightLog>> GetOutrightLogs(GetLogRequest request);

	Task<IEnumerable<OutrightLogDetail>> GetOutrightLogDetails(GetOutrightLogDetailCriteria criteria);
}

public class OutrightLogQueryServiceImp : OutrightLogQueryService
{
	private readonly IDynamicRepository repository;

	public OutrightLogQueryServiceImp(IDynamicRepository repository)
	{
		this.repository = repository;
	}

	public async Task<OutrightLog> GetOutrightLog(GetLogRequest request)
	{
		var criteria = new GetOutrightLogCriteria
		{
			MatchCode = null,
			MatchId = request.MatchId,
			FromDate = request.FromDate,
			ToDate = request.ToDate,
			BalanceUpDay = request.BalanceUpDay
		};

		return await repository.GetAsync<OutrightLog>(criteria);
	}

	public async Task<IEnumerable<OutrightLog>> GetOutrightLogs(GetLogRequest request)
	{
		var criteria = new GetOutrightLogCriteria
		{
			MatchCode = request.MatchCode,
			MatchId = request.MatchId,
			FromDate = request.FromDate,
			ToDate = request.ToDate,
			BalanceUpDay = request.BalanceUpDay
		};

		return await repository.FetchAsync<OutrightLog>(criteria);
	}

	public async Task<IEnumerable<OutrightLogDetail>> GetOutrightLogDetails(GetOutrightLogDetailCriteria criteria)
	{
		return await repository.FetchAsync<OutrightLogDetail>(criteria);
	}
}