namespace Settlement.Sportsbook.Aio.Models;

public class ResultChanged
{
    public string ResourceId { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

    public string Action { get; set; }

    public string OtherInfo { get; set; } = string.Empty;

    public DateTimeOffset LogDate { get; set; }

    public short ReSettleType { get; set; }
}