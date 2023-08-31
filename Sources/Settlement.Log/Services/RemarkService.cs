using Settlement.Log.Models.BetTypeElement;
using System.Text;
using ItemElement = Settlement.Log.Models.EventCounterElement.ItemElement;

namespace Settlement.Log.Services;

public interface RemarkService
{
    bool IsFastMarketAction(int actionId);

    string RemarkValue(IEnumerable<BetTypeElement> betTypes, IEnumerable<ItemElement> items);
}

public class RemarkServiceImp : RemarkService
{
    private readonly List<int> fastMarketAction = new() { 165, 166, 167 };

    private readonly RemarkNodeService remarkNodeService;

    public RemarkServiceImp(RemarkNodeService remarkNodeService)
    {
        this.remarkNodeService = remarkNodeService;
    }

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
}