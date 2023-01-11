namespace Settlement.Excel.Models;

public class ExcelModel<T>
{
    public List<T> ExportData { get; set; }

    public string TemplateSheetName { get; set; }

    public string TemplatePath { get; set; }

    public string OutputSheetName { get; set; }

    public string OutputFileName { get; set; }

    public string Title { get; set; }
}