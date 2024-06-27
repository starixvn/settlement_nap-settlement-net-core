using Settlement.Log.Models.BetTypeElement;
using System.Text;
using ItemElement = Settlement.Log.Models.EventCounterElement.ItemElement;

namespace Settlement.Log.Services;

public interface RemarkService
{
    bool IsFastMarketAction(int actionId);

    string RemarkValue(IEnumerable<BetTypeElement> betTypes, IEnumerable<ItemElement> items);

    string RemarkValue(string value);
}

public class RemarkServiceImp(RemarkNodeService remarkNodeService) : RemarkService
{
    private readonly List<int> fastMarketAction = new() { 165, 166, 167 };

    public bool IsFastMarketAction(int actionId)
    {
        return fastMarketAction.Contains(actionId);
    }

    public string RemarkValue(IEnumerable<BetTypeElement> betTypes, IEnumerable<ItemElement> items)
    {
        var remark = new StringBuilder();

        remark.Append(remarkNodeService.EventCounterLogs(items ?? new List<ItemElement>()));
        remark.Append(remarkNodeService.BetTypeLogs(betTypes ?? new List<BetTypeElement>()));
        return remark.ToString();
    }

    public string RemarkValue(string value)
    {
        var arrayRemark = value.Split('|');
        var remark = new StringBuilder();
        const int remarkPosition = 2;
        if (arrayRemark.Length > remarkPosition)
        {
            remark.Append(remarkNodeService.EventCounter(arrayRemark[remarkPosition]));
        }

        if (arrayRemark.Length > 1)
        {
            var goalValue = arrayRemark.Length > 3 ? arrayRemark[3] : string.Empty;
            remark.Append(remarkNodeService.BetTypes(arrayRemark[1], goalValue));
            remark.Append(arrayRemark[0]);
        }

        return remark.ToString();
    }
}