using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
using System.Text;
using static Settlement.Core.Constants.BetType;

namespace Settlement.Log.Services;

public interface RemarkNodeService
{
    string EventCounter(string content);

    string BetTypes(string content, string goalValue);
}

public class RemarkNodeServiceImp : RemarkNodeService
{
    private static readonly string[] EventCounterLabels = new[] { "", "G", "C", "FK", "GK", "T", "", "P" };

    private readonly PositionService positionService;

    private readonly XmlConvertService xmlConvertService;

    public RemarkNodeServiceImp(PositionService positionService, XmlConvertService xmlConvertService)
    {
        this.positionService = positionService;
        this.xmlConvertService = xmlConvertService;
    }

    public string EventCounter(string content)
    {
        if (string.IsNullOrEmpty(content))
        {
            return string.Empty;
        }

        var eventCounterLog = new List<string>();
        var eventCountersRoot = xmlConvertService.Deserialize<EventCountersRoot>(content);
        foreach (var item in eventCountersRoot.Items)
        {
            var resultLog = ParseEventCounterResult(item.Result);
            eventCounterLog.Add($"{item.Position}:{resultLog}");
        }

        return $"Event Counter: {string.Join("; ", eventCounterLog)}<br/>";
    }

    public string BetTypes(string content, string goalValue)
    {
        var betTypes = xmlConvertService.Deserialize<BetTypesRoot>(content);
        var remark = new StringBuilder();
        foreach (var betType in betTypes.BetType)
        {
            var betTypeId = Convert.ToInt32(betType.Id);
            var positionAndResult = positionService.PositionName(betTypeId, betType.Item);

            remark.Append(betTypeId == FastMarketBetType.TimeMachineOverUnder && !string.IsNullOrWhiteSpace(goalValue)
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

        const int position = 6;
        var resultLog = new List<string>();
        var charArray = result.ToCharArray();
        Array.Reverse(charArray);
        for (var i = 0; i < charArray.Length; i++)
        {
            if (i != 0 && i != position)
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