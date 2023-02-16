using Settlement.Core.Services;

namespace Settlement.Outright.Services;

public interface OutrightLogService
{
	Task<IEnumerable<OutrightLog>> GetLogForView(GetLogRequest request);

	Task<IEnumerable<OutrightLog>> GetLogBySubmit(GetLogRequest request);
}

public class OutrightLogServiceImp : OutrightLogService
{
	private readonly OutrightLogProcessService outrightLogService;

	private readonly IBalanceUpService balanceUpService;

	public OutrightLogServiceImp(OutrightLogProcessService outrightLogService, IBalanceUpService balanceUpService)
	{
		this.outrightLogService = outrightLogService;
		this.balanceUpService = balanceUpService;
	}

	public async Task<IEnumerable<OutrightLog>> GetLogForView(GetLogRequest request)
	{
		request.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
		if (request.MatchId is not null && request.MatchId > 0)
		{
			return await outrightLogService.GetOutrightLogByOutrightId(request);
		}

		return await outrightLogService.GetOutrightLogByMatchCode(request);
	}

	public async Task<IEnumerable<OutrightLog>> GetLogBySubmit(GetLogRequest request)
	{
		request.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
		var logs = await outrightLogService.GetOutrightLogByMatchCode(request);
		if (logs.Count >= 1 || !request.MatchCode.All(char.IsNumber))
		{
			return logs;
		}
		request.MatchId = int.Parse(request.MatchCode);
		logs = await outrightLogService.GetOutrightLogByOutrightId(request);

		return logs;
	}
}