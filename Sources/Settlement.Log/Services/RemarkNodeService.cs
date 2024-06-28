using Settlement.Constants;
using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
using System.Text;
using ItemElement = Settlement.Log.Models.EventCounterElement.ItemElement;

namespace Settlement.Log.Services;

public interface RemarkNodeService
{
    string EventCounterLogs(IEnumerable<ItemElement> items);

    string BetTypeLogs(IEnumerable<BetTypeElement> betTypes);

    string BetTypes(string content, string goalValue);

    string EventCounter(string content);
}

public class RemarkNodeServiceImp(PositionService positionService, XmlConvertService xmlConvertService)
    : RemarkNodeService
{
    private static readonly string[] EventCounterLabels = ["", "G", "C", "FK", "GK", "T", "", "P"];

    private const int MaxLength = 6;

    public string EventCounterLogs(IEnumerable<ItemElement> items)
    {
        var eventCounterLog = (from item in items let resultLog = ParseEventCounterResult(item.Result) select $"{item.Position}:{resultLog}").ToList();

        return eventCounterLog.Count > 0 ? $"<br/>Event Counter: {string.Join("; ", eventCounterLog)}<br/>" : "<br/>";
    }

    public string BetTypeLogs(IEnumerable<BetTypeElement> betTypes)
    {
        var remark = new StringBuilder();
        foreach (var betType in betTypes)
        {
            var betTypeId = Convert.ToInt32(betType.Id);
            var positionAndResult = positionService.PositionName(betTypeId, betType.Item.FirstOrDefault());

            remark.Append($"ResourceId: {betTypeId} | Result: {positionAndResult}<br/>");
        }

        return remark.ToString();
    }

    public string EventCounter(string content)
    {
        if (string.IsNullOrEmpty(content))
        {
            return string.Empty;
        }

        var eventCountersRoot = xmlConvertService.Deserialize<EventCountersRootOldStyle>(content) ?? new EventCountersRootOldStyle();
        var eventCounterLog = (from item in eventCountersRoot.Items let resultLog = ParseEventCounterResult(item.Result) select $"{item.Position}:{resultLog}").ToList();

        return $"Event Counter: {string.Join("; ", eventCounterLog)}<br/>";
    }

    public string BetTypes(string content, string goalValue)
    {
        var betTypes = xmlConvertService.Deserialize<BetTypesRootOldStyle>(content);
        var remark = new StringBuilder();
        if (betTypes.BetTypes is null)
        {
            return remark.ToString();
        }
        foreach (var betType in betTypes.BetTypes)
        {
            var betTypeId = Convert.ToInt32(betType.Id);
            var positionAndResult = positionService.PositionName(betTypeId, betType.Item.FirstOrDefault());

            remark.Append(betTypeId == BetType.FastMarketBetType.TimeMachineOverUnder && !string.IsNullOrWhiteSpace(goalValue)
                ? $"ResourceId: {betTypeId} | Result: {positionAndResult}, ({goalValue})<br/>"
                : $"ResourceId: {betTypeId} | Result: {positionAndResult}<br/>");
        }

        return remark.ToString();
    }

    private static string ParseEventCounterResult(string result)
    {
        if (result == "00000000")
        {
            return "N";
        }

        var resultLog = new List<string>();
        var charArray = result.ToCharArray();
        Array.Reverse(charArray);
        for (var i = 0; i < charArray.Length; i++)
        {
            if (i != 0 && i != MaxLength)
            {
                var c = charArray[i];
                if (c != '0')
                {
                    resultLog.Add($"{c}{EventCounterLabels[i]}");
                }
            }
        }

        return string.Join(",", resultLog);
    }
}