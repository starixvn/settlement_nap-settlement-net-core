namespace Settlement.Log.Models;

public class ProviderResultLog
{
    public string ResultType { get; set; }

    public string Action { get; set; }

    public DateTime Time { get; set; }

    public string ProviderName { get; set; }

    public string ResultValue { get; set; }

    public string Remark { get; set; }
}