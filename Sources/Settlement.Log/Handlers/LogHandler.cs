using MediatR;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;

namespace Settlement.Log.Handlers;

public class LogHandler : IRequestHandler<LogRequest, List<LogModel>>
{
    private readonly Core.Services.IBalanceUpService balanceUpService;
    private readonly LogService logService;

    public LogHandler(
        LogService logService,
        Core.Services.IBalanceUpService balanceUpService)
    {
        this.logService = logService;
        this.balanceUpService = balanceUpService;
    }

    public async Task<List<LogModel>> Handle(LogRequest request, CancellationToken cancellationToken)
    {
        var balanceUpDay = balanceUpService.GetBalanceUpDay().BalanceUpDay;
        request.BalanceUpDay = balanceUpDay;
        var logs = (await logService.GetLog(request)).ToList();
        if (request.IsArchivedLog)
        {
            var archivedLogs = await logService.GetArchiveLog(request);
            logs.AddRange(archivedLogs);
        }

        return await logService.GetLogDetail(logs, request.ProductType);
    }
}