using Settlement.Log.Models.LogElement;
using System.Text.RegularExpressions;

namespace Settlement.Log.Services;

public interface MergeLogService
{
    public string GetMinDate(List<LogItem> logs);

    public string GetMaxDate(List<LogItem> logs);

    public string GetStatistic(IEnumerable<LogItem> logs, Func<IEnumerable<int>, int> aggregation);
}

public class MergeLogServiceImp : MergeLogService
{
    public string GetMaxDate(List<LogItem> logs)
    {
        var validDates = logs.Select(log => DateTime.TryParse(log.Value, out var date) ? date : (DateTime?)null).Where(date => date.HasValue).ToList();

        return validDates.Any() ? $"{logs.First().Name}: {validDates.Max():yyyy-MM-dd HH:mm:ss}" : string.Empty;
    }

    public string GetMinDate(List<LogItem> logs)
    {
        var validDates = logs.Select(log => DateTime.TryParse(log.Value, out var date) ? date : (DateTime?)null).Where(date => date.HasValue).ToList();

        return validDates.Any() ? $"{logs.First().Name}: {validDates.Min():yyyy-MM-dd HH:mm:ss}" : string.Empty;
    }

    public string GetStatistic(IEnumerable<LogItem> logs, Func<IEnumerable<int>, int> aggregation)
    {
        var firstLog = logs.First();
        var values = logs.Select(l => ExtractNumericValue(l.Value));
        var unit = GetUnit(firstLog.Value);

        return $"{firstLog.Name}: {aggregation(values)}{unit}";
    }

    private static string GetUnit(string input)
    {
        var unitPart = Regex.Match(input, @"\D+").Value;

        return unitPart.Length == input.Length ? string.Empty : unitPart;
    }

    private static int ExtractNumericValue(string input)
    {
        var numericPart = Regex.Match(input, @"^\d+").Value;
        return int.TryParse(numericPart, out var numericValue) ? numericValue : 0;
    }
}