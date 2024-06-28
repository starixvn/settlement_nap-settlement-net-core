namespace Settlement.Models;

public interface ResultDetailBase
{
    public string ResourceId { get; set; }
    public byte? SettlementStatusId { get; set; }
}

public class ResultDetail : ResultDetailBase
{
    private string value;

    public int? MatchId { get; set; }

    public string ResourceId { get; set; }

    public int SourceId { get; set; }

    public string SourceName { get; set; }

    public string HomeValue
    {
        get => UppercaseFirst(value);

        set => this.value = value;
    }

    public bool InvalidValue { get; set; }

    public string AwayValue { get; set; }

    public string TicketStatus { get; set; }

    public byte? ResultStatusId { get; set; }

    public byte? SettlementStatusId { get; set; }

    public string OtherInfo { get; set; }

    private static string UppercaseFirst(string value)
    {
        return string.IsNullOrEmpty(value) ? null : char.ToUpper(value[0]) + value[1..];
    }
}