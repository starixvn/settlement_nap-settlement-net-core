using MediatR;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Log.Handlers
{
    public class LogHandler : IRequestHandler<LogRequest, List<LogModel>>
    {
        private readonly LogService logService;

        public LogHandler(LogService logService)
        {
            this.logService = logService;
        }

        public async Task<List<LogModel>> Handle(LogRequest request, CancellationToken cancellationToken) => await logService.GetLog(request);
    }
}