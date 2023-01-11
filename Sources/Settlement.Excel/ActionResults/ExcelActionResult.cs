using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Settlement.Excel.Models;
using Settlement.Excel.Services;

namespace Settlement.Excel.ActionResults;

public class ExcelActionResult<T> : IActionResult
{
    private const string ContentType = "application/vnd.ms-excel";
    private const string ExcelExtension = ".xls";
    private readonly ExcelService<T> excelService;
    private readonly ExcelModel<T> excelModel;

    public ExcelActionResult(ExcelService<T> excelService, ExcelModel<T> excelModel)
    {
        this.excelService = excelService;
        this.excelModel = excelModel;
    }

    public Task ExecuteResultAsync(ActionContext context)
    {
        var response = context.HttpContext.Response;
        response.Clear();
        response.ContentType = ContentType;
        response.Headers.Add("Content-disposition", $"attachment; filename={excelModel.OutputFileName}{ExcelExtension}");
        excelService.WriteToStream(excelModel, response.Body);

        return Task.CompletedTask;
    }
}