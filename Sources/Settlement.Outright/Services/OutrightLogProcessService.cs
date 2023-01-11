using Settlement.Core.Services;
using Settlement.Outright.Requests;

namespace Settlement.Outright.Services
{
    public interface OutrightLogProcessService
    {
        Task<IEnumerable<OutrightLog>> GetLogForView(GetLogRequest request);

        Task<IEnumerable<OutrightLog>> GetLogForExcel(GetLogRequest request);
    }

    public class OutrightLogProcessServiceImp : OutrightLogProcessService
    {
        private readonly OutrightLogService outrightLogService;

        private readonly IBalanceUpService balanceUpService;

        public OutrightLogProcessServiceImp(OutrightLogService outrightLogService, IBalanceUpService balanceUpService)
        {
            this.outrightLogService = outrightLogService;
            this.balanceUpService = balanceUpService;
        }

        public async Task<IEnumerable<OutrightLog>> GetLogForExcel(GetLogRequest request)
        {
            request.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
            var logs = await outrightLogService.GetOutrightLogByMatchCode(request);
            if (logs.Any() && request.MatchCode.All(char.IsNumber))
            {
                request.MatchId = int.Parse(request.MatchCode);
                logs = await outrightLogService.GetOutrightLogByOutrightId(request);
            }

            return logs;
        }

        public async Task<IEnumerable<OutrightLog>> GetLogForView(GetLogRequest request)
        {
            IEnumerable<OutrightLog> logs;
            request.BalanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
            if (request.MatchId != null && request.MatchId > 0)
            {
                logs = await outrightLogService.GetOutrightLogByOutrightId(request);
                request.MatchCode = request.MatchId.ToString() ?? "";
            }
            else
            {
                logs = await outrightLogService.GetOutrightLogByMatchCode(request);
            }

            return logs;
        }
    }
}