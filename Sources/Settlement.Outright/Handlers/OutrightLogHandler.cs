using MediatR;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers
{
    public class OutrightLogHandler : IRequestHandler<GetLogRequest, IEnumerable<OutrightLog>>
    {
        private readonly OutrightLogProcessService outrightLogProcessService;

        public OutrightLogHandler(OutrightLogProcessService outrightLogProcessService,
                ExportLogService exportLogService)
        {
            this.outrightLogProcessService = outrightLogProcessService;
        }

        public async Task<IEnumerable<OutrightLog>> Handle(GetLogRequest request, CancellationToken cancellationToken) => await outrightLogProcessService.GetLogForView(request);
    }
}