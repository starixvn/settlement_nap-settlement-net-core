using Settlement.Log.Contants;
using Settlement.Log.Models.LogElement;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Settlement.Log.Services;

public interface MergeLogService
{
    public string DistinctLogsString(List<DistinctElement> distinctElements);

    public string MergeLog(IEnumerable<RootElement> roots);
}

public class MergeLogServiceImp : MergeLogService
{
    public string DistinctLogsString(List<DistinctElement> distinctElements)
    {
        if (distinctElements.Any())
        {
            var logs = distinctElements[0].Logs ?? [];
            return string.Join("; ", logs.Select(l => $"{l.Name}: {l.Value}"));
        }

        return string.Empty;
    }

    public string MergeLog(IEnumerable<RootElement> roots)
    {
        var logGroups = roots.SelectMany(r => r.Logs ?? []).GroupBy(log => (log.Name, log.Type))
            .ToDictionary(
                group => group.Key,
                group => group.ToList());

        var mergedLogs = logGroups.Where(group => group.Value.Any()).Select(item =>
            {
                return item.Key.Item2 switch
                {
                    LogType.DateMin => GetMinDate(item.Value),
                    LogType.DateMax => GetMaxDate(item.Value),
                    LogType.Min => GetStatistic(item.Value, values => values.Min()),
                    LogType.Max => GetStatistic(item.Value, values => values.Max()),
                    LogType.Sum => GetStatistic(item.Value, values => values.Sum()),
                    _ => string.Empty
                };
            })
            .ToList();

        return string.Join("; ", mergedLogs.Where(log => !string.IsNullOrEmpty(log)));
    }

    private static DateTime? GetDate(LogItem log)
    {
        const string formatDate = "yyyy-MM-dd HH:mm:ss";
        return DateTime.TryParseExact(log.Value, formatDate, CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var date)
            ? date
            : null;
    }

    private static string GetMaxDate(List<LogItem> logs)
    {
        var validDates = logs.Select(GetDate).Where(date => date.HasValue).ToList();

        return validDates.Any() ? $"{logs[0].Name}: {validDates.Max():yyyy-MM-dd HH:mm:ss}" : string.Empty;
    }

    private static string GetMinDate(List<LogItem> logs)
    {
        var validDates = logs.Select(GetDate).Where(date => date.HasValue).ToList();

        return validDates.Any() ? $"{logs[0].Name}: {validDates.Min():yyyy-MM-dd HH:mm:ss}" : string.Empty;
    }

    private static string GetStatistic(List<LogItem> logs, Func<IEnumerable<int>, int> aggregation)
    {
        var firstLog = logs[0];
        var values = logs.Select(l => ExtractNumericValue(l.Value));
        var unit = GetUnit(firstLog.Value);

        return $"{firstLog.Name}: {aggregation(values)}{unit}";
    }

    private static string GetUnit(string input)
    {
        var unitPart = Regex.Match(input, @"\D+", RegexOptions.None, TimeSpan.FromSeconds(1)).Value;

        return unitPart.Length == input.Length ? string.Empty : unitPart;
    }

    private static int ExtractNumericValue(string input)
    {
        var numericPart = Regex.Match(input, @"^\d+", RegexOptions.None, TimeSpan.FromSeconds(1)).Value;
        return int.TryParse(numericPart, out var numericValue) ? numericValue : 0;
    }
}