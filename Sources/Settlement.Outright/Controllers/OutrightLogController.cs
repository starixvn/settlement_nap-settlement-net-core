using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Outright.Controllers;

[ApiController]
[Route("api/outrightLog")]
[SessionAuthorize]
public class OutrightLogController : ControllerBase
{
    private readonly IMediator mediator;

    private readonly ExportLogService exportLogService;

    public OutrightLogController(IMediator mediator, ExportLogService exportLogService)
    {
        this.mediator = mediator;

        this.exportLogService = exportLogService;
    }

    [HttpPost]
    [Route("get-log")]
    public async Task<IActionResult> GetLeagues(GetLogRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

    [HttpPost]
    [Route("export-excel")]
    public async Task<IActionResult> ExportExcel(GetLogRequest request) => await exportLogService.ExportExcel(request);
}