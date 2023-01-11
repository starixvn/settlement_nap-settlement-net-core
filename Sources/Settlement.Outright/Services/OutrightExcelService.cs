using NPOI.SS.UserModel;
using Settlement.Excel.Extensions;
using Settlement.Excel.Services;
using System.Globalization;

namespace Settlement.Outright.Services;

public class OutrightExcelService : BaseExcelService<OutrightLogDetail>
{
    private const int StartTicketDataRow = 6;

    public const string LongDateTimeFormat = "MMM dd, yyyy hh:mm:ss tt";

    protected override void AssignBody(ISheet sheet, List<OutrightLogDetail> exportData)
    {
        var rowCount = exportData.Count;
        const int userNameColumn = 2;
        const int teamNameColumn = 3;
        const int leagueNameColumn = 4;
        const int actionNameColumn = 5;
        const int resultColumn = 6;
        const int remarkColumn = 7;

        for (var index = 0; index < rowCount; index++)
        {
            var item = exportData[index];

            var numberOfRow = index + StartTicketDataRow;
            var row = index % 2 == 0 ?
                sheet.CopyRow(TemplateSheet, StartTicketDataRow, numberOfRow) :
            sheet.CopyRow(TemplateSheet, StartTicketDataRow + 1, numberOfRow);

            row.Cells[0].SetCellValue(index + 1);
            row.Cells[1].SetCellValue(item.LogDate.ToString(LongDateTimeFormat));
            row.Cells[userNameColumn].SetCellValue(item.Username);
            row.Cells[teamNameColumn].SetCellValue(item.TeamName);
            row.Cells[leagueNameColumn].SetCellValue(item.LeagueName);
            row.Cells[actionNameColumn].SetCellValue(item.ActionNameEn);
            row.Cells[resultColumn].SetCellValue(CultureInfo.CurrentCulture.TextInfo.ToTitleCase(item.Result.ToLowerInvariant()));
            row.Cells[remarkColumn].SetCellValue(item.Remark);
        }

        if (rowCount == 1)
        {
            var row = sheet.GetRow(StartTicketDataRow + 1);
            sheet.RemoveRow(row);
            sheet.ShiftRows(StartTicketDataRow + 1, sheet.LastRowNum, -1);
        }
    }
}