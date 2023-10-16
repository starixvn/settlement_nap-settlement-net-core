using Settlement.Log.Models.BetTypeElement;
using System.Text;
using ItemElement = Settlement.Log.Models.EventCounterElement.ItemElement;

namespace Settlement.Log.Services;

public interface RemarkNodeService
{
    string EventCounterLogs(IEnumerable<ItemElement> items);

    string BetTypeLogs(IEnumerable<BetTypeElement> betTypes);
}

public class RemarkNodeServiceImp : RemarkNodeService
{
    private static readonly string[] EventCounterLabels = { "", "G", "C", "FK", "GK", "T", "", "P" };

    private const int MaxLength = 6;

    private readonly PositionService positionService;

    public RemarkNodeServiceImp(PositionService positionService)
    {
        this.positionService = positionService;
    }

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
            if (i != 0 && i != MaxLength) //NOSONAR
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