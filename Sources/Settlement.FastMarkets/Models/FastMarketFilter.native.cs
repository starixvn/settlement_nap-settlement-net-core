namespace Settlement.FastMarkets.Models;

public class FastMarketFilter
{
    public FastMarketFilter()
    {
        var interval = new IntervalTime();
        Interval = interval.Value;
    }

    public List<Selection> Interval { get; }

    public List<Selection> ResultStatus => LoadDataStatus(Status.ResultStatus);

    private List<Selection> LoadDataStatus(Dictionary<int, string> result)
    {
        return result.Select(item => new Selection
        {
            Value = item.Key.ToString(),
            Text = item.Value
        }).ToList();
    }
}