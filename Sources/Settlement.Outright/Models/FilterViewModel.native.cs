namespace Settlement.Outright.Models;

public class FilterViewModel
{
    public DateTimeOffset MoveBetsDay { get; set; }

    public DateTimeOffset FromDate { get; set; }

    public DateTimeOffset ToDate { get; set; }
}