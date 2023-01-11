using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using Settlement.Excel.Extensions;
using Settlement.Excel.Models;

namespace Settlement.Excel.Services;

public interface ExcelService<T>
{
    void WriteToStream(ExcelModel<T> model, Stream stream);
}

public abstract class BaseExcelService<T> : ExcelService<T>
{
    private const string DefaultTemplateSheetName = "Template";

    private HSSFWorkbook workbook;

    private ExcelModel<T> excelModel;

    protected ISheet TemplateSheet { get; set; }

    public void WriteToStream(ExcelModel<T> model, Stream stream)
    {
        excelModel = model;
        excelModel.TemplateSheetName = string.IsNullOrEmpty(excelModel.TemplateSheetName) ? DefaultTemplateSheetName : excelModel.TemplateSheetName;

        LoadTemplate();

        AssignData();

        RemoveTemplate();

        Write(stream);
    }

    private void LoadTemplate()
    {
        FileStream stream = null;
        try
        {
            var templatePath = AppDomain.CurrentDomain.BaseDirectory + excelModel.TemplatePath;
            stream = new FileStream(templatePath, FileMode.Open, FileAccess.Read);
            workbook = new HSSFWorkbook(stream);
            TemplateSheet = workbook.GetSheet(excelModel.TemplateSheetName);
        }
        finally
        {
            stream?.Close();
        }
    }

    private void AssignData()
    {
        var sheet = workbook.CloneSheet(excelModel.TemplateSheetName, excelModel.OutputSheetName);

        AssignTitle(sheet);

        AssignBody(sheet, excelModel.ExportData);
    }

    protected abstract void AssignBody(ISheet sheet, List<T> exportData);

    protected virtual void AssignTitle(ISheet sheet)
    {
        var row = sheet.CopyRow(TemplateSheet, 0, 0);
        row.Cells[0].SetCellValue(excelModel.Title);
    }

    private void RemoveTemplate()
    {
        var sheet = workbook.GetSheet(excelModel.TemplateSheetName);

        if (sheet != null)
        {
            var sheetIndex = workbook.GetSheetIndex(sheet);
            workbook.RemoveSheetAt(sheetIndex);
        }
    }

    private void Write(Stream stream)
    {
        workbook.Write(stream);
    }
}