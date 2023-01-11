using NPOI.SS.UserModel;

namespace Settlement.Excel.Extensions;

public static class ExcelExtension
{
    public static ISheet CloneSheet(this IWorkbook workbook, string sourceSheetName, string newSheetName)
    {
        var sheetIndex = workbook.GetSheetIndex(sourceSheetName);
        var newSheet = workbook.CloneSheet(sheetIndex);
        var newSheetIndex = workbook.GetSheetIndex(newSheet);
        workbook.SetSheetName(newSheetIndex, newSheetName);
        return newSheet;
    }

    public static IRow CopyRow(this ISheet sheet, ISheet sourceSheet, int sourceRowIndex, int destRowIndex)
    {
        if (sheet.LastRowNum < destRowIndex)
        {
            for (var i = sheet.LastRowNum + 1; i <= destRowIndex; i++)
            {
                sheet.CreateRow(i);
            }
        }

        // Get the source / new row
        var sourceRow = sourceSheet.GetRow(sourceRowIndex);
        if (sourceRow == null)
        {
            return null;
        }

        var newRow = sheet.GetRow(destRowIndex);
        newRow = newRow ?? sheet.CreateRow(destRowIndex);

        // Loop through source columns to add to new row
        for (int i = 0; i < sourceRow.LastCellNum; i++)
        {
            // Grab a copy of the old/new cell
            var oldCell = sourceRow.GetCell(i);
            var newCell = newRow.CreateCell(i);

            sheet.CopyCell(oldCell, newCell);
        }

        return newRow;
    }

    private static ICell CellByCellType(ICell sourceCell, ICell destCell)
    {
        switch (sourceCell.CellType)
        {
            case CellType.Unknown:
            case CellType.Blank:
                destCell.SetCellValue(sourceCell.StringCellValue);
                break;

            case CellType.Boolean:
                destCell.SetCellValue(sourceCell.BooleanCellValue);
                break;

            case CellType.Error:
                destCell.SetCellErrorValue(sourceCell.ErrorCellValue);
                break;

            case CellType.Numeric:
                destCell.SetCellValue(sourceCell.NumericCellValue);
                break;

            default:
                destCell.SetCellValue(sourceCell.RichStringCellValue);
                break;
        }

        return destCell;
    }

    public static ICell CopyCell(this ISheet sheet, ICell sourceCell, ICell destCell)
    {
        // If the old cell is null jump to next cell
        if (sourceCell == null)
        {
            return null;
        }

        sheet.GetCellComment(0, 0);
        destCell.CellStyle = sourceCell.CellStyle;

        // Set the cell data type
        destCell.SetCellType(sourceCell.CellType);

        return CellByCellType(sourceCell, destCell);
    }

    public static void DeleteRow(this ISheet sheet, int rowIndex)
    {
        sheet.RemoveRow(sheet.GetRow(rowIndex));
    }
}