namespace Settlement.FastMarkets.Models;
public class XMLResult<T>
{
    public string Result { get; set; }

    public IEnumerable<T> OriginalItems { get; set; }
}
