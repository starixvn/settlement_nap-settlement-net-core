using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Services;
using Settlement.Excel.ActionResults;
using Settlement.Excel.Models;
using Settlement.Excel.Services;
using Settlement.Outright.Requests;

namespace Settlement.Outright.Services
{
    public interface ExportLogService
    {
        Task<IActionResult> ExportExcel(GetLogRequest request);
    }

    public class ExportLogServiceImp : ExportLogService
    {
        private readonly OutrightLogProcessService outrightLogProcessService;

        private readonly IRefDataService refDataService;

        private readonly ExcelService<OutrightLogDetail> excelService;

        private const string ShortDateFormat = "MMM dd, yyyy";

        private const string ExcelOutrightLogFileName = "OutrightLogs";

        private const string ExcelOutrightSheetName = "Logs";

        private const string TemplateViewLogs = @"/App_Data/Template/ViewLogsOutright.xls";

        public ExportLogServiceImp(OutrightLogProcessService outrightLogProcessService,
            IRefDataService refDataService,
            ExcelService<OutrightLogDetail> excelService)
        {
            this.outrightLogProcessService = outrightLogProcessService;
            this.refDataService = refDataService;
            this.excelService = excelService;
        }

        public async Task<IActionResult> ExportExcel(GetLogRequest request)
        {
            var date = $"From {request.FromDate.ToString(ShortDateFormat)} to {request.ToDate.ToString(ShortDateFormat)}";
            var title = $"Outright Settlement Log - {date}";
            var logs = await outrightLogProcessService.GetLogForExcel(request);
            var outrightLogDetail = logs
                .FirstOrDefault(m => m.LeagueId == request.LeagueId)
                ?.OutrightLogDetails;

            outrightLogDetail?.ForEach(x => x.RefDataService = refDataService);

            var excelOutrightLogModel = new ExcelModel<OutrightLogDetail>
            {
                ExportData = outrightLogDetail,
                OutputFileName = ExcelOutrightLogFileName,
                OutputSheetName = ExcelOutrightSheetName,
                Title = title,
                TemplatePath = TemplateViewLogs
            };

            return new ExcelActionResult<OutrightLogDetail>(excelService, excelOutrightLogModel);
        }
    }
}