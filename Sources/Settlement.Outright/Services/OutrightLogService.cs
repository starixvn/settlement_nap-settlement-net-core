using Settlement.Core.Services;

namespace Settlement.Outright.Services
{
    public interface OutrightLogService
    {
        Task<IEnumerable<OutrightLog>> GetLogForView(GetLogRequest request);
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
            IEnumerable<OutrightLog> logs;
            request.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
            if (request.MatchId is not null && request.MatchId > 0)
            {
                logs = await outrightLogService.GetOutrightLogByOutrightId(request);
            }
            else
            {
                logs = await outrightLogService.GetOutrightLogByMatchCode(request);
            }

            return logs;
        }
    }
}